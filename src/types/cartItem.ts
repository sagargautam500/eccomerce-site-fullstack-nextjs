import { Category } from "./category";

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  stock: number;
  category: Category;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  product: CartProduct;
}

// // Guest cart item (stored in localStorage)
// interface GuestCartItem {
//   id: string;
//   productId: string;
//   quantity: number;
//   size?: string;
//   color?: string;
//   product: CartProduct;
// }