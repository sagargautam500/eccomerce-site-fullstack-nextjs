// src/app/api/payment/esewa/verify/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const verifySchema = z.object({
  orderId: z.string().min(1),
  refId: z.string().optional(),
  transactionCode: z.string().optional(),
  status: z.string(),
  amount: z.string().optional(),
  uuid: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // console.log("Verify request body:", body);

    const validationResult = verifySchema.safeParse(body);

    if (!validationResult.success) {
      console.error("Validation errors:", validationResult.error.issues);
      return NextResponse.json(
        { error: "Invalid verification data", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { orderId, transactionCode, status } = validationResult.data;

    // Check payment status
    if (status !== "COMPLETE" && status !== "SUCCESS") {
      console.log(`Payment not completed. Status: ${status}`);
      
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "failed" },
      });

      return NextResponse.json(
        { error: `Payment not completed. Status: ${status}` },
        { status: 400 }
      );
    }

    // Update order status to paid
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "paid",
        esewaRefId: transactionCode || undefined,
      },
    });

    // console.log(`✅ Payment verified for order ${orderId}`);

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      order: updatedOrder,
    });
  } catch (err) {
    console.error("eSewa verification error:", err);
    return NextResponse.json(
      { error: "Failed to verify payment", details: (err as Error).message },
      { status: 500 }
    );
  }
}