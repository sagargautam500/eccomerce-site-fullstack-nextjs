// ==============================================
// src/app/api/wishlist/get/route.ts
// Get user's wishlist
// ==============================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth"; // Next Auth v5
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const wishlist = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            originalPrice: true,
            thumbnail: true,
            stock: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform to match frontend interface
    const formattedWishlist = wishlist.map((item) => ({
      id: item.id,
      productId: item.productId,
      product: item.product,
    }));

    return NextResponse.json({
      success: true,
      wishlist: formattedWishlist,
    });
  } catch (error) {
    console.error("Fetch wishlist error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}
