// src/actions/api/userApi.ts
"use server";

import prisma from "@/lib/prisma";
import { User } from "@/types/user";

// Get user by email with relations
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          take: 5, // Get last 5 orders
        },
        wishlist: {
          include: {
            product: true,
          },
        },
        cartItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name || undefined,
      email: user.email,
      role: user.role as 'admin' | 'user',
      orders: user.orders || [],
      wishlist: user.wishlist || [],
      cartItems: user.cartItems || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
}

// Get user profile (basic info only)
export async function getUserProfile(email: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name || undefined,
      email: user.email,
      role: user.role as 'admin' | 'user',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return null;
  }
}

// Update user profile
export async function updateUserProfile(
  email: string,
  data: { name?: string }
): Promise<{ success: boolean; message: string; user?: User }> {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: {
        name: data.name,
      },
    });

    return {
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name || undefined,
        email: user.email,
        role: user.role as 'admin' | 'user',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return {
      success: false,
      message: "Failed to update profile",
    };
  }
}

// Get user statistics
export async function getUserStats(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        orders: true,
        wishlist: true,
        cartItems: true,
      },
    });

    if (!user) return null;

    const totalOrders = user.orders.length;
    const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0);
    const wishlistCount = user.wishlist.length;
    const cartItemsCount = user.cartItems.length;

    return {
      totalOrders,
      totalSpent,
      wishlistCount,
      cartItemsCount,
    };
  } catch (error) {
    console.error("Failed to fetch user stats:", error);
    return null;
  }
}