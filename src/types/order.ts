export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  brand?: string;
  category?: string;
  subCategory?: string;
  thumbnail: string;
  images?: string[];
  size?: string;
  color?: string;
  quantity: number;
  stockAtOrder?: number;
  rating?: number;
  totalReviews?: number;
  isFeatured?: boolean;
}

export interface OrderAddress {
  id: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  zipCode?: string;
  country: string;
}

export interface Order {
  id: string;
  userId?: string;
  email: string;
  amount: number; // Amount in NPR
  currency: string; // default "npr"
  status: string; // pending, paid, failed, expired, refunded
  paymentMethod?: string; // card, esewa, khalti, connectips
  stripeCheckoutSession?: string;
  stripePaymentIntentId?: string;
  esewaRefId?: string;
  khaltiToken?: string;
  items: OrderItem[]; // all items in this order
  shippingAddress?: OrderAddress;
  createdAt: Date;
  updatedAt: Date;
}
