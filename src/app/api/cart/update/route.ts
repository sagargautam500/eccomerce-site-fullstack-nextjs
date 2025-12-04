// src/app/api/cart/update/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    const { itemId, quantity } = await req.json();
    if (!itemId || quantity === undefined) {
      return NextResponse.json(
        { success: false, message: "Item ID and quantity required" },
        { status: 400 }
      );
    }

    // Verify ownership - cart item belongs to this user
    const cartItem = await prisma.cartItem.findFirst({
      where: { 
        id: itemId, 
        userId: user.id 
      },
      include: { 
        product: { 
          select: { stock: true } 
        } 
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { success: false, message: "Cart item not found" },
        { status: 404 }
      );
    }

    // Remove if quantity < 1
    if (quantity < 1) {
      await prisma.cartItem.delete({ 
        where: { id: itemId } 
      });
      return NextResponse.json({ success: true, message: "Item removed" });
    }

    // Check stock
    if (quantity > cartItem.product.stock) {
      return NextResponse.json(
        { success: false, message: "Exceeds available stock" },
        { status: 400 }
      );
    }

    // Update quantity
    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return NextResponse.json({ success: true, message: "Cart updated" });
  } catch (error: any) {
    console.error("Update cart error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update" },
      { status: 500 }
    );
  }
}