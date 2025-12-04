// src/app/api/cart/get/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ cart: [] });
    }

    // Try to find user by email first (most reliable)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true, email: true },
    });


    if (!user) {
      console.log("User not found in DB");
      return NextResponse.json({ cart: [] });
    }
    const userId = user.id;
    
    // Get cart items for this user
    const cart = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            originalPrice: true,
            thumbnail: true,
            stock: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // console.log("Cart items for user:", userId, "Count:", cart.length);

    return NextResponse.json({ cart });
  } catch (error) {
    console.error("Get cart error:", error);
    return NextResponse.json({ cart: [] });
  }
}