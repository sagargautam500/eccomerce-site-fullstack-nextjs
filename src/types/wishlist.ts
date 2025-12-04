// src/types/wishlist.ts

export interface Wishlist {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WishlistProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  stock: number;
  category: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: WishlistProduct;
}

// ✅ API Response Types
export interface WishlistApiResponse {
  wishlist: WishlistItem[];
}

export interface AddWishlistResponse {
  success: boolean;
  message?: string;
}