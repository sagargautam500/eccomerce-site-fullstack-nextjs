// src/app/api/products/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Fix images field (string[] stored as JSON)
    const formatted = products.map(product => ({
      ...product,
      images: Array.isArray(product.images)
        ? product.images
        : JSON.parse(product.images as unknown as string),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }));

    return NextResponse.json({ products: formatted }, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
