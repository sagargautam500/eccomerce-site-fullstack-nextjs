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
  // Optional unique identifiers for eSewa/Khalti
  esewaRefId: z.string().optional(),
  khaltiToken: z.string().optional(),
  shippingAddress: z.object({
    fullName: z.string().min(1),
    phone: z.string().min(1),
    addressLine: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().optional(),
    country: z.string().min(1),
  }),
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

    const {
      items,
      user,
      paymentMethod,
      esewaRefId,
      khaltiToken,
      shippingAddress,
    } = validation.data;

    // =========================
    // ✅ Calculate Total Amount
    // =========================
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

    // =========================
    // ✅ Handle Card Payment (Stripe)
    // =========================
    if (paymentMethod === "card") {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: items.map((item) => ({
          price_data: {
            currency: "npr",
            product_data: { name: item.name },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })),
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/stripe/cancel`,
        customer_email: user.email,
        metadata: { userId: user.id },
      });

      // Check if order already exists
      let order = await prisma.order.findUnique({
        where: { stripeCheckoutSession: session.id },
      });

      if (!order) {
        // Create order + items atomically
        order = await prisma.$transaction(async (tx) => {
          // 1. Create Order Address Snapshot
          const orderAddress = await tx.orderAddress.create({
            data: {
              fullName: shippingAddress.fullName,
              phone: shippingAddress.phone,
              addressLine: shippingAddress.addressLine,
              city: shippingAddress.city,
              state: shippingAddress.state,
              zipCode: shippingAddress.zipCode || "",
              country: shippingAddress.country,
            },
          });

          const newOrder = await tx.order.create({
            data: {
              userId: user.id,
              email: user.email,
              amount,
              currency: "npr",
              status: "pending",
              paymentMethod: "card",
              stripeCheckoutSession: session.id,
              stripePaymentIntentId: session.payment_intent as string | null,
              shippingAddressId: orderAddress.id,
            },
          });

          await tx.orderItem.createMany({
            data: items.map((item) => ({
              orderId: newOrder.id,
              productId: item.productId,
              name: item.name,
              price: item.price,
              thumbnail: item.thumbnail,
              size: item.size ?? null,
              color: item.color ?? null,
              quantity: item.quantity,
            })),
          });

          return newOrder;
        });
      }

      return NextResponse.json({
        url: session.url,
        orderId: order.id,
        paymentMethod,
      });
    }

    // =========================
    // 🟦 eSewa & Khalti Payments
    // =========================
    if (paymentMethod === "esewa" || paymentMethod === "khalti") {
      // Check for existing order (prevent duplicates)
      let order;
      if (paymentMethod === "esewa" && esewaRefId) {
        order = await prisma.order.findUnique({ where: { esewaRefId } });
      }
      if (paymentMethod === "khalti" && khaltiToken) {
        order = await prisma.order.findUnique({ where: { khaltiToken } });
      }

      if (!order) {
        order = await prisma.$transaction(async (tx) => {
          // 1. Create Order Address Snapshot
          const orderAddress = await tx.orderAddress.create({
            data: {
              fullName: shippingAddress.fullName,
              phone: shippingAddress.phone,
              addressLine: shippingAddress.addressLine,
              city: shippingAddress.city,
              state: shippingAddress.state,
              zipCode: shippingAddress.zipCode || "",
              country: shippingAddress.country,
            },
          });

          const newOrder = await tx.order.create({
            data: {
              userId: user.id,
              email: user.email,
              amount,
              currency: "npr",
              status: "pending",
              paymentMethod,
              esewaRefId: paymentMethod === "esewa" ? esewaRefId : null,
              khaltiToken: paymentMethod === "khalti" ? khaltiToken : null,
              shippingAddressId: orderAddress.id,
            },
          });

          await tx.orderItem.createMany({
            data: items.map((item) => ({
              orderId: newOrder.id,
              productId: item.productId,
              name: item.name,
              price: item.price,
              thumbnail: item.thumbnail,
              size: item.size ?? null,
              color: item.color ?? null,
              quantity: item.quantity,
            })),
          });

          return newOrder;
        });
      }

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
