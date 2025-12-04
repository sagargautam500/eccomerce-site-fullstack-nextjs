// ==============================================
// src/app/api/wishlist/check/[productId]/route.ts
// Check if product is in wishlist
// ==============================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId } = await params;

    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      isInWishlist: !!wishlistItem,
    });
  } catch (error) {
    console.error("Check wishlist error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to check wishlist" },
      { status: 500 }
    );
  }
}