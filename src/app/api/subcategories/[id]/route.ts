// app/api/subcategories/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: { id: string };
}

export async function GET(req: Request, { params }: Params) {
  const { id } = params;

  try {
    const subCategory = await prisma.subCategory.findUnique({
      where: { id },
    });

    if (!subCategory) {
      return NextResponse.json({ message: "SubCategory not found" }, { status: 404 });
    }

    return NextResponse.json({ subCategory });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to fetch subcategory" }, { status: 500 });
  }
}
