// src/actions/admin/categoryActions.ts
"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { deleteImageFile } from "@/lib/deleteImage";

async function isAdmin() {
  const session = await auth();
  return session?.user?.role === "admin";
}

// GET ALL CATEGORIES WITH COUNTS
export interface CategoryFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export async function getAllCategoriesWithCounts(filters: CategoryFilters = {}) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  const { page = 1, limit = 10, search = "" } = filters;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.name = { contains: search.trim(), mode: "insensitive" };
  }

  try {
    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        include: {
          _count: {
            select: { products: true, subCategories: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.category.count({ where }),
    ]);

    return {
      success: true,
      categories: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
        productCount: cat._count.products,
        subCategoryCount: cat._count.subCategories,
        createdAt: cat.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw new Error("Failed to fetch categories");
  }
}

// CREATE CATEGORY
export async function createCategory(data: { name: string; image?: string }) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const slug = data.name.toLowerCase().replace(/\s+/g, "-");

    // Check if category with same slug exists
    const existing = await prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new Error("Category with this name already exists");
    }

    const category = await prisma.category.create({
      data: { 
        name: data.name, 
        slug, 
        image: data.image || null 
      },
    });

    revalidatePath("/admin/categories");
    return { success: true, category };
  } catch (error: any) {
    console.error("Failed to create category:", error);
    throw new Error(error.message || "Failed to create category");
  }
}

// UPDATE CATEGORY
export async function updateCategory(id: string, data: { name: string; image?: string }) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const slug = data.name.toLowerCase().replace(/\s+/g, "-");

    // Check if another category with same slug exists
    const existing = await prisma.category.findFirst({
      where: { 
        slug,
        NOT: { id }
      },
    });

    if (existing) {
      throw new Error("Category with this name already exists");
    }

    // Get old category data to check for image changes
    const oldCategory = await prisma.category.findUnique({
      where: { id },
      select: { image: true },
    });

    if (!oldCategory) {
      throw new Error("Category not found");
    }

    // Update category
    const category = await prisma.category.update({
      where: { id },
      data: { 
        name: data.name, 
        slug, 
        image: data.image || null 
      },
    });

    // Delete old image if it was replaced with a new one
    if (
      oldCategory.image && 
      oldCategory.image !== data.image &&
      oldCategory.image.startsWith("/uploads/")
    ) {
      await deleteImageFile(oldCategory.image);
    }

    revalidatePath("/admin/categories");
    return { success: true, category };
  } catch (error: any) {
    console.error("Failed to update category:", error);
    throw new Error(error.message || "Failed to update category");
  }
}

// DELETE CATEGORY
export async function deleteCategory(id: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    // Check if category has products or subcategories
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { 
            products: true,
            subCategories: true 
          },
        },
      },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    if (category._count.products > 0) {
      throw new Error(
        `Cannot delete category with ${category._count.products} products. Please reassign or delete products first.`
      );
    }

    if (category._count.subCategories > 0) {
      throw new Error(
        `Cannot delete category with ${category._count.subCategories} subcategories. Please delete subcategories first.`
      );
    }

    // Delete category from database
    await prisma.category.delete({ where: { id } });

    // Delete associated image file if it exists
    if (category.image && category.image.startsWith("/uploads/")) {
      await deleteImageFile(category.image);
    }

    revalidatePath("/admin/categories");
    return { success: true, message: "Category deleted successfully" };
  } catch (error: any) {
    console.error("Failed to delete category:", error);
    throw new Error(error.message || "Failed to delete category");
  }
}

// GET CATEGORY BY ID
export async function getCategoryByIdAdmin(id: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { 
            products: true,
            subCategories: true 
          },
        },
        subCategories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      image: category.image,
      productCount: category._count.products,
      subCategoryCount: category._count.subCategories,
      subCategories: category.subCategories,
      createdAt: category.createdAt.toISOString(),
    };
  } catch (error: any) {
    console.error("Failed to fetch category:", error);
    throw new Error(error.message || "Failed to fetch category");
  }
}