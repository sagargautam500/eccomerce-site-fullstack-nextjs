// app/api/categories/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { subCategories: true }, // include nested subcategories
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to fetch categories" }, { status: 500 });
  }
}
