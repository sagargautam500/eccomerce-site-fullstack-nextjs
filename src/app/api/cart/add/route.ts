// src/app/api/cart/add/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      console.log("No session user email");
      return NextResponse.json(
        { success: false, message: "Please login first" },
        { status: 401 }
      );
    }

    // Find user by email (most reliable)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    const userId = user.id;

    const { productId, quantity = 1, size, color } = await req.json();
    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    // Check product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, stock: true, name: true },
    });
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }
    if (product.stock < quantity) {
      return NextResponse.json(
        { success: false, message: "Not enough stock available" },
        { status: 400 }
      );
    }

    // Check for existing cart item
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId,
        productId,
        size: size || null,
        color: color || null,
      },
    });
    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (newQty > product.stock) {
        return NextResponse.json(
          { success: false, message: "Cannot add more than available stock" },
          { status: 400 }
        );
      }
      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
      return NextResponse.json({ success: true, message: "Cart updated" });
    }

    // Create new cart item
    const newItem = await prisma.cartItem.create({
      data: {
        userId,
        productId,
        quantity,
        size: size || null,
        color: color || null,
      },
    });
    return NextResponse.json({ success: true, message: "Added to cart" });
  } catch (error: any) {
    console.error("Add to cart error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to add to cart" },
      { status: 500 }
    );
  }
}