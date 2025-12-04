// ==============================================
// src/app/api/wishlist/add/route.ts
// Add product to wishlist
// ==============================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
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

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Check if already in wishlist
    const existingItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (existingItem) {
      return NextResponse.json({
        success: true,
        message: "Already in wishlist",
      });
    }

    // Add to wishlist
    await prisma.wishlist.create({
      data: {
        userId: session.user.id,
        productId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Added to wishlist",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}
