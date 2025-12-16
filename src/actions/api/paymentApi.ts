"use server";
import axiosInstance from "@/lib/axios";
import { CheckoutItem } from "@/types/checkoutItem";
import { Order } from "@/types/order";
import { User } from "@/types/user";

// Checkout
export async function createCheckoutSession(
  items: CheckoutItem[],
  user: User,
  paymentMethod: string,
  shippingAddress: any
) {
  const { data } = await axiosInstance.post<{
    url: string;
    orderId?: string;
    paymentMethod?: string;
  }>("/api/payment/checkout", {
    items,
    user,
    paymentMethod,
    shippingAddress,
  });
  return data;
}

// Verify Payment stripe
export async function verifyPayment(sessionId: string) {
  const { data } = await axiosInstance.post<{ order: Order }>(
    "/api/payment/stripe/verify-payment",
    { sessionId }
  );
  return data;
}
