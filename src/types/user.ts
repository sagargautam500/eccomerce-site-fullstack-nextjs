import { Order } from './order'
import { CartItem } from './cartItem'
import { Wishlist } from './wishlist'

export interface User {
  id: string
  name?: string
  email: string
  password?: string
  role?:'admin' | 'user'
  resetToken?: string
  resetExpires?: Date
  orders?: Order[]        // optional, can be included when querying with relations
  wishlist?: Wishlist[]   // optional
  cartItems?: CartItem[]  // optional
  
  createdAt?: Date
  updatedAt?: Date
}

