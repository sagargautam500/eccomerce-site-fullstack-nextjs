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
          include: {
            items: true,
          },
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
      role: user.role as "admin" | "user",
      orders: user.orders.map((order) => ({
        id: order.id,
        userId: order.userId || undefined,
        email: order.email,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        paymentMethod: order.paymentMethod || undefined,
        stripeCheckoutSession: order.stripeCheckoutSession || undefined,
        stripePaymentIntentId: order.stripePaymentIntentId || undefined,
        esewaRefId: order.esewaRefId || undefined,
        khaltiToken: order.khaltiToken || undefined,
        items: order.items.map((item) => ({
          id: item.id,
          orderId: item.orderId,
          productId: item.productId,
          name: item.name,
          description: "", // Not stored in OrderItem schema
          price: item.price,
          originalPrice: undefined,
          brand: undefined,
          category: "", // Not stored in OrderItem schema
          subCategory: undefined,
          thumbnail: item.thumbnail,
          images: [],
          size: item.size || undefined,
          color: item.color || undefined,
          quantity: item.quantity,
          stockAtOrder: undefined,
          rating: undefined,
          totalReviews: undefined,
          isFeatured: false,
        })),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })),
      wishlist: user.wishlist.map((w) => ({
        id: w.id,
        userId: w.userId,
        productId: w.productId,
        product: w.product,
        createdAt: w.createdAt,
        updatedAt: new Date(), // Wishlist doesn't have updatedAt in schema
      })),
      cartItems: user.cartItems.map((c) => ({
        id: c.id,
        userId: c.userId,
        productId: c.productId,
        product: {
          id: c.product.id,
          name: c.product.name,
          price: c.product.price,
          originalPrice: c.product.originalPrice || undefined,
          thumbnail: c.product.thumbnail,
          stock: c.product.stock,
          category: c.product.categoryId || "", // Use categoryId as string
        },
        quantity: c.quantity,
        size: c.size || undefined,
        color: c.color || undefined,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
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
      role: user.role as "admin" | "user",
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
        role: user.role as "admin" | "user",
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
    const totalSpent = user.orders.reduce(
      (sum, order) => sum + order.amount,
      0
    );
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
