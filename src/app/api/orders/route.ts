// src/app/api/orders/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");
    // ❗ Require at least one query
    if (!userId && !email) {
      return NextResponse.json(
        { error: "userId or email is required" },
        { status: 400 }
      );
    }

    // Build the WHERE filter
    const where: { userId?: string; email?: string } = {};
    if (userId) where.userId = userId;
    if (email) where.email = email;

    // ==============================
    // ✅ Fetch orders + items
    // ==============================
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: true, // fetch order items
        shippingAddress: true,
      },
    });

    // Convert dates to ISO strings so JSON can return them safely
    const formattedOrders = orders.map((order) => ({
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }));
    // console.log(formattedOrders);
    return NextResponse.json({ orders: formattedOrders });
  } catch (err) {
    console.error("Failed to fetch orders:", err);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
