import { Category, SubCategory } from "./category"

// src/types/product.ts
export interface Product {
  id: string
  name: string
  description: string
  price: number        // stored in NPR
  originalPrice?: number
  brand?: string
  categoryId: string
  subCategoryId: string
  category?: Category|null  // populated relation
  subCategory?:  SubCategory|null // populated relation
  isFeatured: boolean
  images: string[]     // multiple images
  thumbnail: string    // main image
  sizes: string[]      // ["M", "L", "XL"]
  colors: string[]     // ["Red", "Black"]
  stock: number
  rating?: number
  totalReviews?: number
  createdAt: Date
  updatedAt: Date
}
