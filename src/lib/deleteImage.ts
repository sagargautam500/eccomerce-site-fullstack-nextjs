// src/lib/deleteImage.ts
import { unlink } from "fs/promises";
import path from "path";

/**
 * Delete an image file from the uploads folder
 * @param imageUrl - The image URL or path (e.g., "/uploads/products/product-123.jpg" or "product-123.jpg")
 * @returns Promise<boolean> - true if deleted successfully, false otherwise
 */
export async function deleteImageFile(imageUrl: string): Promise<boolean> {
  try {
    // Skip if empty or external URL
    if (!imageUrl || imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return false;
    }

    // Extract filename from URL
    let filename = imageUrl;
    
    // If it's a full path like /uploads/products/file.jpg
    if (imageUrl.startsWith("/uploads/products/")) {
      filename = imageUrl.replace("/uploads/products/", "");
    } else if (imageUrl.startsWith("/products/")) {
      // If it's /products/file.jpg (your old format)
      filename = imageUrl.replace("/products/", "");
    } else if (imageUrl.startsWith("/")) {
      // If it starts with / but not in expected format, skip
      return false;
    }

    // Security: Only delete files that start with "product-" to prevent deleting other files
    if (!filename.startsWith("product-")) {
      console.log(`Skipping deletion of non-product file: ${filename}`);
      return false;
    }

    // Construct full file path
    const filepath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "products",
      filename
    );

    // Delete the file
    await unlink(filepath);
    console.log(`Successfully deleted image: ${filename}`);
    return true;
  } catch (error: any) {
    // File might not exist or already deleted - not a critical error
    if (error.code === "ENOENT") {
      console.log(`Image file not found (already deleted?): ${imageUrl}`);
    } else {
      console.error(`Error deleting image ${imageUrl}:`, error);
    }
    return false;
  }
}

/**
 * Delete multiple image files
 * @param imageUrls - Array of image URLs/paths
 * @returns Promise<number> - Number of successfully deleted files
 */
export async function deleteMultipleImageFiles(
  imageUrls: string[]
): Promise<number> {
  let deletedCount = 0;

  for (const imageUrl of imageUrls) {
    const success = await deleteImageFile(imageUrl);
    if (success) {
      deletedCount++;
    }
  }

  console.log(`Deleted ${deletedCount} out of ${imageUrls.length} images`);
  return deletedCount;
}