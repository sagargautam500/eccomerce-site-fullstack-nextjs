// src/action/admin/subCategoryActions.ts
"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function isAdmin() {
  const session = await auth();
  return session?.user?.role === "admin";
}

// GET ALL SUBCATEGORIES WITH COUNTS
// Add interface
export interface SubCategoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string; // for top-level filter
}

// Replace getAllSubCategoriesWithCounts
export async function getAllSubCategoriesWithCounts(filters: SubCategoryFilters = {}) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  const { page = 1, limit = 9, search = "", categoryId } = filters;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.name = { contains: search.trim(), mode: "insensitive" };
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }

  try {
    const [subcategories, total] = await Promise.all([
      prisma.subCategory.findMany({
        where,
        include: {
          category: { select: { name: true } },
          _count: { select: { products: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.subCategory.count({ where }),
    ]);

    return {
      success: true,
      subcategories: subcategories.map((sub) => ({
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        categoryId: sub.categoryId,
        categoryName: sub.category?.name || "Unknown",
        productCount: sub._count.products,
        createdAt: sub.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Fetch subcategories error:", error);
    throw new Error("Failed to fetch subcategories");
  }
}

// CREATE SUBCATEGORY
export async function createSubCategory(data: {
  name: string;
  categoryId: string;
}) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const slug = data.name.toLowerCase().replace(/\s+/g, "-");

    // Check if subcategory with same slug exists
    const existing = await prisma.subCategory.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new Error("Subcategory with this name already exists");
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    const subcategory = await prisma.subCategory.create({
      data: {
        name: data.name,
        slug,
        categoryId: data.categoryId,
      },
    });

    revalidatePath("/admin/subcategories");
    revalidatePath("/admin/categories");
    return { success: true, subcategory };
  } catch (error: any) {
    console.error("Failed to create subcategory:", error);
    throw new Error(error.message || "Failed to create subcategory");
  }
}

// UPDATE SUBCATEGORY
export async function updateSubCategory(
  id: string,
  data: { name: string; categoryId: string }
) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const slug = data.name.toLowerCase().replace(/\s+/g, "-");

    // Check if another subcategory with same slug exists
    const existing = await prisma.subCategory.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    });

    if (existing) {
      throw new Error("Subcategory with this name already exists");
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    const subcategory = await prisma.subCategory.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        categoryId: data.categoryId,
      },
    });

    revalidatePath("/admin/subcategories");
    revalidatePath("/admin/categories");
    return { success: true, subcategory };
  } catch (error: any) {
    console.error("Failed to update subcategory:", error);
    throw new Error(error.message || "Failed to update subcategory");
  }
}

// DELETE SUBCATEGORY
export async function deleteSubCategory(id: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    // Check if subcategory has products
    const subCategory = await prisma.subCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!subCategory) {
      throw new Error("Subcategory not found");
    }

    if (subCategory._count.products > 0) {
      throw new Error(
        `Cannot delete subcategory with ${subCategory._count.products} products. Please reassign or delete products first.`
      );
    }

    await prisma.subCategory.delete({ where: { id } });

    revalidatePath("/admin/subcategories");
    revalidatePath("/admin/categories");
    return { success: true, message: "Subcategory deleted successfully" };
  } catch (error: any) {
    console.error("Failed to delete subcategory:", error);
    throw new Error(error.message || "Failed to delete subcategory");
  }
}

// GET SUBCATEGORY BY ID
export async function getSubCategoryByIdAdmin(id: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const subCategory = await prisma.subCategory.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!subCategory) {
      throw new Error("Subcategory not found");
    }

    return {
      id: subCategory.id,
      name: subCategory.name,
      slug: subCategory.slug,
      categoryId: subCategory.categoryId,
      categoryName: subCategory.category.name,
      productCount: subCategory._count.products,
      createdAt: subCategory.createdAt.toISOString(),
    };
  } catch (error: any) {
    console.error("Failed to fetch subcategory:", error);
    throw new Error(error.message || "Failed to fetch subcategory");
  }
}