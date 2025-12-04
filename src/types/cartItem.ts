// src/types/cart.ts
// import { Category } from './category'

export interface Cart {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  stock: number;
  category: string; // ✅ Changed to string
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  product: CartProduct;
}


// ✅ API Response Types
export interface CartItemApiResponse {
  cartItems: CartItem[];
}

export interface AddCartItemResponse {
  success: boolean;
  message?: string;
}