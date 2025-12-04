// src/action/api/categoryApi.ts
"use server";
import axiosInstance from "@/lib/axios";
import { Category, SubCategory } from "@/types/category";

// Get all categories (optionally include subcategories)
export async function getAllCategories(): Promise<Category[]> {
  try {
    const res = await axiosInstance.get<{ categories: Category[] }>("/api/categories");
    return res.data.categories;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

// Get single category by ID (optionally include subcategories)
export async function getCategoryById(categoryId: string): Promise<Category | null> {
  try {
    const res = await axiosInstance.get<{ category: Category }>(`/api/categories/${categoryId}`);
    return res.data.category;
  } catch (error) {
    console.error("Failed to fetch category:", error);
    return null;
  }
}

// Get all subcategories
export async function getAllSubCategories(): Promise<SubCategory[]> {
  try {
    const res = await axiosInstance.get<{ subCategories: SubCategory[] }>("/api/subcategories");
    return res.data.subCategories;
  } catch (error) {
    console.error("Failed to fetch subcategories:", error);
    return [];
  }
}

// Get subcategories by category ID
export async function getSubCategoriesByCategory(categoryId: string): Promise<SubCategory[]> {
  try {
    const res = await axiosInstance.get<{ subCategories: SubCategory[] }>(`/api/subcategories?categoryId=${categoryId}`);
    return res.data.subCategories;
  } catch (error) {
    console.error("Failed to fetch subcategories by category:", error);
    return [];
  }
}

// Get single subcategory by ID
export async function getSubCategoryById(subCategoryId: string): Promise<SubCategory | null> {
  try {
    const res = await axiosInstance.get<{ subCategory: SubCategory }>(`/api/subcategories/${subCategoryId}`);
    return res.data.subCategory;
  } catch (error) {
    console.error("Failed to fetch subcategory:", error);
    return null;
  }
}