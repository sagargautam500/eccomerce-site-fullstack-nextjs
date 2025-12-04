// src/app/api/payment/stripe/verify-payment/route.ts
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { z } from "zod";
import prisma from "@/lib/prisma";

const verifySchema = z.object({
  sessionId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validationResult = verifySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid session ID" },
        { status: 400 }
      );
    }

    const { sessionId } = validationResult.data;

    // Verify session with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    // Fetch order from database
    const order = await prisma.order.findFirst({
      where: { stripeCheckoutSession: sessionId },
      select: {
        id: true,
        amount: true,
        currency: true,
        email: true,
        status: true,
        createdAt: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      order: {
        ...order,
        createdAt: order.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("Payment verification error:", err);

    if (err instanceof Error && err.message.includes("No such checkout.session")) {
      return NextResponse.json(
        { error: "Invalid session ID" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}