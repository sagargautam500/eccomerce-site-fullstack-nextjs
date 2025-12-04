// src/actions/admin/orderActions.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { Order } from "@/types/order";
import { auth } from "@/auth";

export interface OrderFilters {
  page?: number;
  limit?: number;
  search?: string;      // for email, user ID, or order ID
  status?: string;
   userId?: string;   // filter by user ID
  startDate?: string;   // ISO date string
  endDate?: string;     // ISO date string
  sort?: "newest" | "oldest" | "amount-high" | "amount-low";
}

// Check if user is admin
async function isAdmin() {
  const session = await auth();
  return session?.user?.role === "admin";
}


export async function getAllOrders(filters: OrderFilters = {}) {
  try {
    if (!(await isAdmin())) {
      throw new Error("Unauthorized");
    }

    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      startDate,
      userId,
      endDate,
      sort = "newest",
    } = filters;

    const skip = (page - 1) * limit;

    // Build WHERE clause
    const where: any = {};

    // Search across email, userId, orderId
    if (search) {
      const searchLower = search.trim().toLowerCase();
      where.OR = [
        { email: { contains: searchLower, mode: "insensitive" } },
        { id: { contains: searchLower, mode: "insensitive" } },
      ];
    }
    
  // 👤 Filter by userId (from user details page)
  if (userId) {
    where.userId = userId;
  }

    // Status filter
    if (status && status !== "all") {
      where.status = status;
    }

    // Date range
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Build ORDER BY
    let orderBy: any = { createdAt: "desc" };
    switch (sort) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "amount-high":
        orderBy = { amount: "desc" };
        break;
      case "amount-low":
        orderBy = { amount: "asc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
    }

    // Fetch data + total count
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { items: true },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    console.error("Get admin orders error:", error);
    throw new Error(error.message || "Failed to fetch orders");
  }
}

export async function deleteOrder(orderId: string) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  await prisma.order.delete({ where: { id: orderId } });
  revalidatePath("/admin/orders");
  return { success: true, message: "Order deleted" };
}

export async function bulkDeleteOrders(orderIds: string[]) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
  revalidatePath("/admin/orders");
  return { success: true, message: "Orders deleted" };
}