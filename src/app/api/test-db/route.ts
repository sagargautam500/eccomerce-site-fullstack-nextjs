// app/api/test-db/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Test connection
    const categories = await prisma.category.findMany({ take: 1 });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Prisma connection error:", error);
    return NextResponse.json(
      { message: "Failed to fetch categories", error: String(error) },
      { status: 500 }
    );
  }
}
