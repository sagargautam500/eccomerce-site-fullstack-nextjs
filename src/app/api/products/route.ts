// src/app/api/products/route.ts
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Get query parameters
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const subCategoryId = searchParams.get("subCategoryId") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Category filter
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Subcategory filter
    if (subCategoryId) {
      where.subCategoryId = subCategoryId;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Get total count for pagination
    const total = await prisma.product.count({ where });

    // Get products
    const products = await prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // Format products
    const formatted = products.map(product => ({
      ...product,
      images: Array.isArray(product.images)
        ? product.images
        : JSON.parse(product.images as unknown as string),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      products: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}