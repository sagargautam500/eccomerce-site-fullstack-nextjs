// src/action/api/categoryApi.ts
"use server";
import prisma from "@/lib/prisma";
import { Category, SubCategory } from "@/types/category";

// Get all categories (optionally include subcategories)
export async function getAllCategories(): Promise<Category[]> {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subCategories: true,
      },
      orderBy: { name: "asc" },
    });
    return categories as Category[];
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

// Get single category by ID (optionally include subcategories)
export async function getCategoryById(
  categoryId: string
): Promise<Category | null> {
  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        subCategories: true,
      },
    });
    return category as Category | null;
  } catch (error) {
    console.error("Failed to fetch category:", error);
    return null;
  }
}

// Get all subcategories
export async function getAllSubCategories(): Promise<SubCategory[]> {
  try {
    const subCategories = await prisma.subCategory.findMany({
      orderBy: { name: "asc" },
    });
    return subCategories as SubCategory[];
  } catch (error) {
    console.error("Failed to fetch subcategories:", error);
    return [];
  }
}

// Get subcategories by category ID
export async function getSubCategoriesByCategory(
  categoryId: string
): Promise<SubCategory[]> {
  try {
    const subCategories = await prisma.subCategory.findMany({
      where: { categoryId },
      orderBy: { name: "asc" },
    });
    return subCategories as SubCategory[];
  } catch (error) {
    console.error("Failed to fetch subcategories by category:", error);
    return [];
  }
}

// Get single subcategory by ID
export async function getSubCategoryById(
  subCategoryId: string
): Promise<SubCategory | null> {
  try {
    const subCategory = await prisma.subCategory.findUnique({
      where: { id: subCategoryId },
    });
    return subCategory as SubCategory | null;
  } catch (error) {
    console.error("Failed to fetch subcategory:", error);
    return null;
  }
}
