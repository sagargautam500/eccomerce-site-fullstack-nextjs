import { Category } from './category'

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
  category: Category;
}

// Wishlist item from API
export interface WishlistItem {
  id: string;
  productId: string;
  product: WishlistProduct;
}

