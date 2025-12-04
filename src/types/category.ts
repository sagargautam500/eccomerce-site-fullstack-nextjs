import { Product } from "./product"

// src/types/category.ts
export interface Category {
  id: string
  name: string
  slug: string
  image?: string
  createdAt?: Date
  // optional relations if populated
  subCategories?: SubCategory[]
  products?: Product[] // only include if needed, otherwise omit
}

export interface SubCategory {
  id: string
  name: string
  slug: string
  categoryId: string
  createdAt?: Date
  // optional relation
  category?: Category
  products?: Product[]
}
