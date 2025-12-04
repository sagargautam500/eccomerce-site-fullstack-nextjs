// src/actions/productApi.ts
"use server";
import axiosInstance from "@/lib/axios";
import { Product } from "@/types/product";

// Get all products
export async function getAllProducts(): Promise<Product[]> {
  try {
    const res = await axiosInstance.get<{ products: Product[] }>("/api/products");
    return res.data.products;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
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
export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await axiosInstance.get<{ products: Product[] }>("/api/products?featured=true");
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
export async function getRelatedProducts(productId: string, category: string, limit: number = 4): Promise<Product[]> {
  try {
    const res = await axiosInstance.get<{ products: Product[] }>(
      `/api/products?category=${category}&exclude=${productId}&limit=${limit}`
    );
    return res.data.products;
  } catch (error) {
    console.error("Failed to fetch related products:", error);
    return [];
  }
}