// src/app/api/checkout/route.ts
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { z } from "zod";

// ======================
// ✅ ZOD SCHEMA
// ======================
const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        name: z.string().min(1),
        price: z.number().positive(),
        thumbnail: z.string().min(1),
        size: z.string().optional(),
        color: z.string().optional(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),

  user: z.object({
    id: z.string().min(1),
    email: z.string().email(),
  }),

  paymentMethod: z.enum(["card", "esewa", "khalti"]).optional().default("card"),
});

// =====================================
// ✅ MAIN CHECKOUT FUNCTION
// =====================================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = checkoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { items, user, paymentMethod } = validation.data;
    
    // =========================
    // ✅ Calculate Total Amount
    // ==========================
    const amount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if (amount < 1) {
      return NextResponse.json(
        { error: "Order amount must be at least 1 NPR" },
        { status: 400 }
      );
    }

    // ================================
    // ✅ Step 1 — Create Order
    // ================================
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        email: user.email,
        amount,
        currency: "npr",
        status: "pending",
        paymentMethod,
      },
    });

    // ================================
    // ✅ Step 2 — Create Order Items snapshot of product
    // ================================
    await prisma.orderItem.createMany({
      data: items.map((item) => ({
        orderId: order.id,

        productId: item.productId,
        name: item.name,
        price: item.price,
        thumbnail: item.thumbnail,
        size: item.size ?? null,
        color: item.color ?? null,
        quantity: item.quantity,
      })),
    });

    // ================================
    // 📌 PAYMENT METHOD HANDLING
    // ================================

    // -------------------------------
    // 💳 CARD PAYMENT — STRIPE
    // -------------------------------
    if (paymentMethod === "card") {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",

        line_items: items.map((item) => ({
          price_data: {
            currency: "npr",
            product_data: {
              name: item.name,
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })),

        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/stripe/cancel?orderId=${order.id}`,

        customer_email: user.email,

        metadata: {
          orderId: order.id,
          userId: user.id,
        },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { stripeCheckoutSession: session.id },
      });

      return NextResponse.json({
        url: session.url,
        orderId: order.id,
        paymentMethod,
      });
    }

    // -------------------------------
    // 🟦 ESEWA & KHALTI PAYMENT
    // -------------------------------
    if (paymentMethod === "esewa" || paymentMethod === "khalti") {
      const paymentUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/payment/${paymentMethod}?orderId=${order.id}`;

      return NextResponse.json({
        url: paymentUrl,
        orderId: order.id,
        paymentMethod,
      });
    }

    return NextResponse.json(
      { error: "Invalid payment method" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
