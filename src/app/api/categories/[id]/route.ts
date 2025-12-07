// app/api/categories/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: { id: string };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Params is now a Promise
) {
  const { id } = await params; // Await params

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { subCategories: true },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch category" },
      { status: 500 }
    );
  }
}
