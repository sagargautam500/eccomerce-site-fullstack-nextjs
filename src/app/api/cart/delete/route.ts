// src/app/api/cart/delete/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function DELETE(req: Request) {
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
    const { itemId } = await req.json();
    if (!itemId) {
      return NextResponse.json(
        { success: false, message: "Item ID required" },
        { status: 400 }
      );
    }

    // Verify ownership - cart item belongs to this user
    const cartItem = await prisma.cartItem.findFirst({
      where: { 
        id: itemId, 
        userId: user.id 
      },
    });
    if (!cartItem) {
      return NextResponse.json(
        { success: false, message: "Cart item not found" },
        { status: 404 }
      );
    }
    // Delete the cart item
    await prisma.cartItem.delete({ 
      where: { id: itemId } 
    });
    return NextResponse.json({ success: true, message: "Item removed" });
  } catch (error: any) {
    console.error("Delete cart error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to remove" },
      { status: 500 }
    );
  }
}