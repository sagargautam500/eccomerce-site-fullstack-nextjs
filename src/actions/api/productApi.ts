// src/actions/api/productApi.ts
"use server";
import axiosInstance from "@/lib/axios";
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
    const queryParams = new URLSearchParams();
    
    if (filters?.search) queryParams.set("search", filters.search);
    if (filters?.categoryId) queryParams.set("categoryId", filters.categoryId);
    if (filters?.subCategoryId) queryParams.set("subCategoryId", filters.subCategoryId);
    if (filters?.minPrice) queryParams.set("minPrice", filters.minPrice);
    if (filters?.maxPrice) queryParams.set("maxPrice", filters.maxPrice);
    if (filters?.featured) queryParams.set("featured", "true");
    if (filters?.page) queryParams.set("page", filters.page.toString());
    if (filters?.limit) queryParams.set("limit", filters.limit.toString());
    
    const res = await axiosInstance.get(`/api/products?${queryParams.toString()}`);
    return res.data;
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
export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const res = await axiosInstance.get<{ product: Product }>(`/api/products/${productId}`);
    return res.data.product;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

// Get products by category
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  try {
    const res = await axiosInstance.get<{ products: Product[] }>(`/api/products?categoryId=${categoryId}`);
    return res.data.products;
  } catch (error) {
    console.error("Failed to fetch products by category:", error);
    return [];
  }
}

// Get featured products
export async function getFeaturedProducts(limit?: number): Promise<Product[]> {
  try {
    const queryParams = new URLSearchParams({ featured: "true" });
    if (limit) queryParams.set("limit", limit.toString());
    
    const res = await axiosInstance.get<{ products: Product[] }>(`/api/products?${queryParams.toString()}`);
    return res.data.products;
  } catch (error) {
    console.error("Failed to fetch featured products:", error);
    return [];
  }
}

// Search products
export async function searchProducts(query: string): Promise<Product[]> {
  try {
    const res = await axiosInstance.get<{ products: Product[] }>(`/api/products?search=${query}`);
    return res.data.products;
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
    const res = await axiosInstance.get<{ products: Product[] }>(
      `/api/products?categoryId=${categoryId}&exclude=${productId}&limit=${limit}`
    );
    return res.data.products;
  } catch (error) {
    console.error("Failed to fetch related products:", error);
    return [];
  }
}