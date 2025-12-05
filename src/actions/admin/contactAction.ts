// src/actions/admin/contactAction.ts
"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function isAdmin() {
  const session = await auth();
  return session?.user?.role === "admin";
}

// Get paginated contacts with search
export async function getContactMessages({
  page = 1,
  limit = 10,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) 
{
      if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  const skip = (page - 1) * limit;
  const take = limit;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { subject: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.contact.count({ where }),
  ]);

  const totalPages = Math.ceil(total / take);

  return {
    contacts,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

// Optional: Delete a contact
export async function deleteContactMessage(id: string) {
      if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.contact.delete({
      where: { id },
    });
    revalidatePath("/admin/contacts");
    return { success: true };
  } catch (error) {
    console.error("Delete contact error:", error);
    return { success: false, message: "Failed to delete contact." };
  }
}