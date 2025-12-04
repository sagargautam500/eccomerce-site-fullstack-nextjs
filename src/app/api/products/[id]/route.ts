// src/app/api/products/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> } // FIX: params is Promise
) {
  try {
    const { id } = await context.params; // FIX: await the whole params object

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id },
        include: {
        category: true,
        subCategory: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Get product error:", error);

    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
