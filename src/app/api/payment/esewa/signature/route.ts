// src/app/api/payment/esewa/signature/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";

const signatureSchema = z.object({
  totalAmount: z.number().positive(),
  transactionUUID: z.string().min(1),
  productCode: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validationResult = signatureSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    const { totalAmount, transactionUUID, productCode } = validationResult.data;

    const secretKey = process.env.ESEWA_SECRET_KEY;
    if (!secretKey) {
      console.error("ESEWA_SECRET_KEY is not defined");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // IMPORTANT: Message format must match exactly what eSewa expects
    // Order: total_amount, transaction_uuid, product_code
    const message = `total_amount=${totalAmount},transaction_uuid=${transactionUUID},product_code=${productCode}`;

    // console.log("Message to sign:", message);
    // console.log("Secret key:", secretKey);

    // Create signature using HMAC-SHA256
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(message)
      .digest("base64");

    console.log("Generated signature:", signature);

    return NextResponse.json({ 
      signature,
      message // Return for debugging
    });
  } catch (err) {
    console.error("Signature API error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}