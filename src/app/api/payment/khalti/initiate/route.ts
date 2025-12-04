// src/app/api/payment/khalti/initiate/route.ts
import axiosInstance from "@/lib/axios";
import { NextResponse } from "next/server";
import { z } from "zod";

// Validate incoming request
const initiateSchema = z.object({
  orderId: z.string().min(1),
  amount: z.number().positive(),
  email: z.string().email().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validationResult = initiateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    const { orderId, amount, email} = validationResult.data;

    const khaltiSecretKey = process.env.KHALTI_SECRET_KEY;
    if (!khaltiSecretKey) {
      return NextResponse.json(
        { error: "Khalti configuration error" },
        { status: 500 }
      );
    }

    const amountInPaisa = amount * 100;

    // Prepare payload
    const payload = {
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/khalti/success`,
      website_url: process.env.NEXT_PUBLIC_BASE_URL,
      amount: amountInPaisa,
      purchase_order_id: orderId,
      purchase_order_name: `Order #${orderId}`,
      customer_info: {
        name: "Customer",
        email: email || "customer@example.com",
        phone: "9800000000",
      },
    };

    // console.log("Khalti initiate payload:", payload);
    // console.log("✅ Using Khalti Secret Key:", khaltiSecretKey);

    // Send request to Khalti
    const response = await axiosInstance.post(
      "https://a.khalti.com/api/v2/epayment/initiate/",
      payload,
      {
        headers: {
          Authorization: `Key ${khaltiSecretKey}`,
        },
      }
    );

    // console.log("Khalti API response:", response.data);

    // Type-cast the response data
    const responseData = response.data as {
      payment_url: string;
      pidx: string;
      expires_at: string;
      expires_in: number;
    };

    // Return success response
    return NextResponse.json({
      payment_url: responseData.payment_url,
      pidx: responseData.pidx,
      expires_at: responseData.expires_at,
      expires_in: responseData.expires_in,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorResponse = error as { response?: { data?: { detail?: string; message?: string }; status?: number } };
    
    console.error("Khalti initiate error:", errorResponse.response?.data || errorMessage);

    return NextResponse.json(
      {
        error:
          errorResponse.response?.data?.detail ||
          errorResponse.response?.data?.message ||
          "Failed to initiate Khalti payment",
      },
      { status: errorResponse.response?.status || 500 }
    );
  }
}
