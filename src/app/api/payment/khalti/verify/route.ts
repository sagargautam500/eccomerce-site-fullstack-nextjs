// ✅ File: src/app/api/payment/khalti/verify/route.ts
import prisma from "@/lib/prisma";
import axios from "axios";
import { NextResponse } from "next/server";
import { z } from "zod";

// Schema validation for request body
const verifySchema = z.object({
  pidx: z.string().min(1),
  orderId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validationResult = verifySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid verification data" },
        { status: 400 }
      );
    }

    const { pidx, orderId } = validationResult.data;
    const khaltiSecretKey = process.env.KHALTI_SECRET_KEY;

    if (!khaltiSecretKey) {
      return NextResponse.json(
        { error: "Khalti configuration error" },
        { status: 500 }
      );
    }

    // 🔍 Verify payment using Khalti lookup API via Axios
    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      {
        headers: {
          Authorization: `Key ${khaltiSecretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data:any = response.data;
    // console.log("✅ Khalti lookup response:", data);

    // Check payment status
    if (data.status !== "Completed") {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "failed" },
      });

      return NextResponse.json(
        { error: `Payment not completed. Status: ${data.status}` },
        { status: 400 }
      );
    }

    // ✅ Update order status to paid
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "paid",
        khaltiToken: pidx,
      },
    });

    // console.log(`🎉 Payment verified successfully for order ${orderId}`);

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      order: updatedOrder,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    const errorResponse = err as { response?: { data?: { detail?: string; error?: string }; status?: number } };
    
    console.error("❌ Khalti verification error:", errorResponse.response?.data || errorMessage);

    return NextResponse.json(
      {
        error:
          errorResponse.response?.data?.detail ||
          errorResponse.response?.data?.error ||
          "Failed to verify payment",
      },
      { status: errorResponse.response?.status || 500 }
    );
  }
}
