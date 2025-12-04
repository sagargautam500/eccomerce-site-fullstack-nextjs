// app/api/subcategories/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    let subCategories;
    if (categoryId) {
      subCategories = await prisma.subCategory.findMany({
        where: { categoryId },
        orderBy: { createdAt: "desc" },
      });
    } else {
      subCategories = await prisma.subCategory.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ subCategories });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to fetch subcategories" }, { status: 500 });
  }
}
