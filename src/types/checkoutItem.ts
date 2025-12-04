export interface CheckoutItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  thumbnail?: string;
}
