// src/app/api/admin/delete-image/route.ts
// Optional API route for manual image deletion from components

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteImageFile } from "@/lib/deleteImage";

export async function DELETE(request: NextRequest) {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get image URL from request
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL required" },
        { status: 400 }
      );
    }

    // 3. Validate it's a Cloudinary URL
    if (!imageUrl.includes('cloudinary.com')) {
      return NextResponse.json(
        { error: "Invalid Cloudinary URL" },
        { status: 400 }
      );
    }

    // 4. Delete from Cloudinary
    const success = await deleteImageFile(imageUrl);

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Image deleted successfully",
      });
    } else {
      return NextResponse.json(
        { error: "Failed to delete image" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Delete image error:", error);
    return NextResponse.json(
      { error: error.message || "Delete failed" },
      { status: 500 }
    );
  }
}