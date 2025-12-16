// src/actions/admin/userActions.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma"; // <-- your prisma client

// GET ALL USERS
// Add this interface at the top
export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  sort?: "newest" | "oldest" | "name";
}

// Replace your existing getAllUsers
export async function getAllUsers(filters: UserFilters = {}) {
  const { page = 1, limit = 10, search = "", role, sort = "newest" } = filters;

  const skip = (page - 1) * limit;

  // Build WHERE
  const where: any = {};
  if (search) {
    const s = search.trim();
    where.OR = [
      { name: { contains: s, mode: "insensitive" } },
      { email: { contains: s, mode: "insensitive" } },
    ];
  }

  if (role && role !== "all") {
    where.role = role;
  }

  // Build ORDER BY
  let orderBy: any = { createdAt: "desc" };
  switch (sort) {
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    case "name":
      orderBy = { name: "asc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    success: true,
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
// GET SINGLE USER DETAILS + COUNTS
export async function getUserDetails(id: string) {
  if (!id) return null;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: true,
      cartItems: true,
      wishlist: true,
      addresses: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    orderCount: user.orders.length,
    cartItemCount: user.cartItems.length,
    wishlistCount: user.wishlist.length,
    addresses: user.addresses,
  };
}

// CREATE USER (Admin Only)
export async function createUser(data: {
  name?: string;
  email: string;
  password?: string;
  role?: string;
}) {
  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: data.password ?? null,
      role: data.role ?? "user",
    },
  });

  revalidatePath("/admin/users");
}

// UPDATE USER
export async function updateUser(
  id: string,
  data: { name?: string; email?: string; role?: string }
) {
  await prisma.user.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/users");
}

// DELETE USER
export async function deleteUser(id: string) {
  await prisma.user.delete({
    where: { id },
  });

  revalidatePath("/admin/users");
}

// BULK DELETE USERS
export async function bulkDeleteUsers(ids: string[]) {
  await prisma.user.deleteMany({
    where: { id: { in: ids } },
  });

  revalidatePath("/admin/users");
}
