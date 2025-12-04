// src/app/api/orders/[id]/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. await the whole params object
  const { id } = await params;

  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, user: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const formattedOrder = {
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };

    return NextResponse.json({ order: formattedOrder });
  } catch (err) {
    console.error("Failed to fetch order:", err);
    return NextResponse.json(
      { error: "Failed to fetch order details" },
      { status: 500 }
    );
  }
}