// src/app/api/wishlist/delete/route.ts
// Remove product from wishlist
// ==============================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    const existingItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { success: false, message: "Item not found in wishlist" },
        { status: 404 }
      );
    }

    await prisma.wishlist.delete({
      where: { id: existingItem.id },
    });

    return NextResponse.json({
      success: true,
      message: "Removed from wishlist",
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}
