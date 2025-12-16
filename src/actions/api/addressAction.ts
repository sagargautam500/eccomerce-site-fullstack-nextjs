"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Type definition matching the component's state
interface AddressData {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean; // Optional in form, but good to handle
}

export async function getUserAddresses() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "User not authenticated" };
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isDefault: "desc" }, // Default address first
        { createdAt: "desc" },
      ],
    });

    return { success: true, addresses };
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return { success: false, message: "Failed to fetch addresses" };
  }
}

export async function createAddress(data: AddressData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    // If setting as default, unset other defaults first
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    await prisma.address.create({
      data: {
        userId: session.user.id,
        ...data,
      },
    });

    revalidatePath("/checkout");
    return { success: true, message: "Address created successfully" };
  } catch (error: any) {
    console.error("Error creating address:", error);
    throw new Error(error.message || "Failed to create address");
  }
}

export async function updateAddress(id: string, data: AddressData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    // Verify ownership
    const existing = await prisma.address.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      throw new Error("Address not found or unauthorized");
    }

    // If setting as default, unset other defaults first
    if (data.isDefault && !existing.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    await prisma.address.update({
      where: { id },
      data: {
        ...data,
      },
    });

    revalidatePath("/checkout");
    return { success: true, message: "Address updated successfully" };
  } catch (error: any) {
    console.error("Error updating address:", error);
    throw new Error(error.message || "Failed to update address");
  }
}

export async function deleteAddress(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    // Verify ownership
    const existing = await prisma.address.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      throw new Error("Address not found or unauthorized");
    }

    await prisma.address.delete({
      where: { id },
    });

    revalidatePath("/checkout");
    return { success: true, message: "Address deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting address:", error);
    throw new Error(error.message || "Failed to delete address");
  }
}

export async function setDefaultAddress(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    // Use transaction to ensure consistency
    await prisma.$transaction([
      // Unset all defaults for this user
      prisma.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      }),
      // Set the new default
      prisma.address.update({
        where: { id, userId: session.user.id }, // Verify ownership implicitly by filter
        data: { isDefault: true },
      }),
    ]);

    revalidatePath("/checkout");
    return { success: true, message: "Default address updated" };
  } catch (error: any) {
    console.error("Error setting default address:", error);
    throw new Error(error.message || "Failed to set default address");
  }
}
