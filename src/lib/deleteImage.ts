// src/lib/deleteImage.ts
import cloudinary from "@/lib/cloudnary";

/**
 * Extract public_id from Cloudinary URL
 * Example: https://res.cloudinary.com/demo/image/upload/v1234567890/products/product-abc123.jpg
 * Returns: products/product-abc123
 */
function extractPublicId(imageUrl: string): string | null {
  try {
    // Check if it's a Cloudinary URL
    if (!imageUrl.includes('cloudinary.com')) {
      return null;
    }

    // Extract the public_id from the URL
    // Pattern: .../upload/v{version}/{folder}/{filename}.{extension}
    const matches = imageUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
    
    if (matches && matches[1]) {
      return matches[1]; // This is the public_id
    }

    return null;
  } catch (error) {
    console.error("Error extracting public_id:", error);
    return null;
  }
}

/**
 * Delete an image from Cloudinary
 * @param imageUrl - The Cloudinary image URL
 * @returns Promise<boolean> - true if deleted successfully, false otherwise
 */
export async function deleteImageFile(imageUrl: string): Promise<boolean> {
  try {
    // Skip if empty
    if (!imageUrl) {
      return false;
    }

    // Skip if not a Cloudinary URL
    if (!imageUrl.includes('cloudinary.com')) {
      console.log(`Skipping non-Cloudinary URL: ${imageUrl}`);
      return false;
    }

    // Extract public_id
    const publicId = extractPublicId(imageUrl);
    
    if (!publicId) {
      console.error(`Could not extract public_id from URL: ${imageUrl}`);
      return false;
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      console.log(`Successfully deleted image from Cloudinary: ${publicId}`);
      return true;
    } else if (result.result === 'not found') {
      console.log(`Image not found in Cloudinary (may be already deleted): ${publicId}`);
      return false;
    } else {
      console.error(`Failed to delete image from Cloudinary: ${publicId}`, result);
      return false;
    }
  } catch (error: any) {
    console.error(`Error deleting image from Cloudinary: ${imageUrl}`, error);
    return false;
  }
}

/**
 * Delete multiple images from Cloudinary
 * @param imageUrls - Array of Cloudinary image URLs
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

  console.log(`Deleted ${deletedCount} out of ${imageUrls.length} images from Cloudinary`);
  return deletedCount;
}

/**
 * Bulk delete images from Cloudinary (more efficient for large batches)
 * @param imageUrls - Array of Cloudinary image URLs
 * @returns Promise<number> - Number of successfully deleted files
 */
export async function bulkDeleteCloudinaryImages(
  imageUrls: string[]
): Promise<number> {
  try {
    // Extract all public_ids
    const publicIds = imageUrls
      .map(url => extractPublicId(url))
      .filter((id): id is string => id !== null);

    if (publicIds.length === 0) {
      console.log('No valid Cloudinary URLs to delete');
      return 0;
    }

    // Cloudinary allows deleting up to 100 images at once
    const batchSize = 100;
    let deletedCount = 0;

    for (let i = 0; i < publicIds.length; i += batchSize) {
      const batch = publicIds.slice(i, i + batchSize);
      
      try {
        const result = await cloudinary.api.delete_resources(batch);
        
        // Count successful deletions
        if (result.deleted) {
          const successfulDeletes = Object.values(result.deleted).filter(
            (status) => status === 'deleted'
          ).length;
          deletedCount += successfulDeletes;
        }
      } catch (error) {
        console.error(`Error deleting batch ${i / batchSize + 1}:`, error);
      }
    }

    console.log(`Bulk deleted ${deletedCount} out of ${publicIds.length} images from Cloudinary`);
    return deletedCount;
  } catch (error: any) {
    console.error('Bulk delete error:', error);
    return 0;
  }
}