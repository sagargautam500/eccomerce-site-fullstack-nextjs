// src/actions/api/productApi.ts
"use server";
import prisma from "@/lib/prisma";
import { Product } from "@/types/product";

// Get all products with filters
export async function getAllProducts(filters?: {
  search?: string;
  categoryId?: string;
  subCategoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
}): Promise<{
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  try {
    const page = filters?.page || 1;
    const limit = filters?.limit || 12;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" as const } },
        {
          description: {
            contains: filters.search,
            mode: "insensitive" as const,
          },
        },
      ];
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.subCategoryId) {
      where.subCategoryId = filters.subCategoryId;
    }

    if (filters?.featured) {
      where.isFeatured = true;
    }

    if (filters?.minPrice || filters?.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = parseInt(filters.minPrice);
      if (filters.maxPrice) where.price.lte = parseInt(filters.maxPrice);
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      products: products as Product[],
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return {
      products: [],
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0,
    };
  }
}

// Get single product by ID
export async function getProductById(
  productId: string
): Promise<Product | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    return product as Product | null;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

// Get products by category
export async function getProductsByCategory(
  categoryId: string
): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: { categoryId },
      orderBy: { createdAt: "desc" },
    });
    return products as Product[];
  } catch (error) {
    console.error("Failed to fetch products by category:", error);
    return [];
  }
}

// Get featured products
export async function getFeaturedProducts(limit?: number): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: { isFeatured: true },
      take: limit || 8,
      orderBy: { createdAt: "desc" },
    });
    return products as Product[];
  } catch (error) {
    console.error("Failed to fetch featured products:", error);
    return [];
  }
}

// Search products
export async function searchProducts(query: string): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { description: { contains: query, mode: "insensitive" as const } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
    return products as Product[];
  } catch (error) {
    console.error("Failed to search products:", error);
    return [];
  }
}

// Get related products (by category, excluding current product)
export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit: number = 4
): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId,
        id: { not: productId },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    return products as Product[];
  } catch (error) {
    console.error("Failed to fetch related products:", error);
    return [];
  }
}
