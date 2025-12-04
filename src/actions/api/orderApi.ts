// src/actions/api/orderApi.ts
"use server";

import axiosInstance from "@/lib/axios";
import { Order } from "@/types/order";

// ✅ Export each as a top-level async function
export async function getOrderDetails(orderId: string) {
  const { data } = await axiosInstance.get<{ order: Order }>(
    `/api/orders/${orderId}`
  );
  return data;
}

export async function getOrders(userId?: string, email?: string) {
  const params = new URLSearchParams();
  if (userId) params.append("userId", userId);
  if (email) params.append("email", email);

  const { data } = await axiosInstance.get<{ orders: Order[] }>(
    `/api/orders?${params.toString()}`
  );
  return data;
}