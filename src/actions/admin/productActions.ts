// src/actions/admin/productActions.ts
"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { bulkDeleteCloudinaryImages, deleteMultipleImageFiles } from "@/lib/deleteImage";

// Types
export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  subCategoryId?: string;
  sort?: "newest" | "oldest" | "price-low" | "price-high" | "name";
  featured?: boolean;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  brand?: string;
  categoryId: string;
  subCategoryId: string;
  isFeatured: boolean;
  thumbnail: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  rating?: number;
  totalReviews?: number;
}

// Check if user is admin
async function isAdmin() {
  const session = await auth();
  return session?.user?.role === "admin";
}

// ============================================
// ADMIN-ONLY: GET PRODUCTS WITH PAGINATION & FILTERS
// ============================================
export async function getAllProducts(filters: ProductFilters = {}) {
  try {
    if (!(await isAdmin())) {
      throw new Error("Unauthorized");
    }

    const {
      page = 1,
      limit = 10,
      search = "",
      categoryId,
      subCategoryId,
      sort = "newest",
      featured,
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (subCategoryId) {
      where.subCategoryId = subCategoryId;
    }

    if (featured !== undefined) {
      where.isFeatured = featured;
    }

    // Build orderBy
    let orderBy: any = {};
    switch (sort) {
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "price-low":
        orderBy = { price: "asc" };
        break;
      case "price-high":
        orderBy = { price: "desc" };
        break;
      case "name":
        orderBy = { name: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    // Fetch products and total count
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          subCategory: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    console.error("Get admin products error:", error);
    throw new Error(error.message || "Failed to fetch products");
  }
}

// ============================================
// ADMIN-ONLY: GET PRODUCT STATS
// ============================================
export async function getProductStats() {
  try {
    if (!(await isAdmin())) {
      throw new Error("Unauthorized");
    }

    const [totalProducts, inStock, outOfStock, featured, lowStock] =
      await Promise.all([
        prisma.product.count(),
        prisma.product.count({ where: { stock: { gt: 0 } } }),
        prisma.product.count({ where: { stock: 0 } }),
        prisma.product.count({ where: { isFeatured: true } }),
        prisma.product.count({ where: { stock: { gt: 0, lte: 5 } } }),
      ]);

    return {
      success: true,
      stats: {
        totalProducts,
        inStock,
        outOfStock,
        featured,
        lowStock,
      },
    };
  } catch (error: any) {
    console.error("Get product stats error:", error);
    throw new Error(error.message || "Failed to fetch product stats");
  }
}

// ============================================
// ADMIN-ONLY: GET SINGLE PRODUCT WITH ADMIN DATA
// ============================================
export async function getAdminProductById(productId: string) {
  try {
    if (!(await isAdmin())) {
      throw new Error("Unauthorized");
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        subCategory: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            wishlist: true,
            cartItems: true,
          },
        },
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    return { success: true, product };
  } catch (error: any) {
    console.error("Get admin product error:", error);
    throw new Error(error.message || "Failed to fetch product");
  }
}

// ============================================
// ADMIN-ONLY: CREATE PRODUCT
// ============================================
export async function createProduct(data: ProductFormData) {
  try {
    if (!(await isAdmin())) {
      throw new Error("Unauthorized");
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    // Verify subcategory
    const subCategory = await prisma.subCategory.findUnique({
      where: { id: data.subCategoryId },
    });

    if (!subCategory) {
      throw new Error("Subcategory not found");
    }

    // Verify subcategory belongs to the selected category
    if (subCategory.categoryId !== data.categoryId) {
      throw new Error("Subcategory does not belong to the selected category");
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice || null,
        brand: data.brand || null,
        categoryId: data.categoryId,
        subCategoryId: data.subCategoryId,
        isFeatured: data.isFeatured,
        thumbnail: data.thumbnail,
        images: data.images,
        sizes: data.sizes,
        colors: data.colors,
        stock: data.stock,
        rating: data.rating || 0,
        totalReviews: data.totalReviews || 0,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/subcategories");
    revalidatePath("/products");

    return { success: true, product, message: "Product created successfully" };
  } catch (error: any) {
    console.error("Create product error:", error);
    throw new Error(error.message || "Failed to create product");
  }
}

// ============================================
// ADMIN-ONLY: UPDATE PRODUCT
// ============================================
export async function updateProduct(productId: string, data: ProductFormData) {
  try {
    if (!(await isAdmin())) {
      throw new Error("Unauthorized");
    }

    // Check if product exists and get old images
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      throw new Error("Product not found");
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    // Verify subcategory if provided
    if (data.subCategoryId) {
      const subCategory = await prisma.subCategory.findUnique({
        where: { id: data.subCategoryId },
      });

      if (!subCategory) {
        throw new Error("Subcategory not found");
      }

      if (subCategory.categoryId !== data.categoryId) {
        throw new Error(
          "Subcategory does not belong to the selected category"
        );
      }
    }

    // Find Cloudinary images to delete (old images not in new data)
    const oldImages = [
      existingProduct.thumbnail,
      ...existingProduct.images,
    ].filter(Boolean);
    
    const newImages = [
      data.thumbnail,
      ...data.images,
    ].filter(Boolean);

    const imagesToDelete = oldImages.filter(
      (oldImg) => !newImages.includes(oldImg)
    );

    // Update product
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice || null,
        brand: data.brand || null,
        categoryId: data.categoryId,
        subCategoryId: data.subCategoryId || null,
        isFeatured: data.isFeatured,
        thumbnail: data.thumbnail,
        images: data.images,
        sizes: data.sizes,
        colors: data.colors,
        stock: data.stock,
        rating: data.rating || 0,
        totalReviews: data.totalReviews || 0,
      },
    });

    // Delete old images from Cloudinary after successful update
    if (imagesToDelete.length > 0) {
      // Use background deletion to not block the response
      deleteMultipleImageFiles(imagesToDelete).catch((error) => {
        console.error("Failed to delete old images from Cloudinary:", error);
      });
    }

    revalidatePath("/admin/products");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/subcategories");
    revalidatePath("/products");
    revalidatePath(`/products/${productId}`);

    return { success: true, product, message: "Product updated successfully" };
  } catch (error: any) {
    console.error("Update product error:", error);
    throw new Error(error.message || "Failed to update product");
  }
}

// ============================================
// ADMIN-ONLY: DELETE PRODUCT
// ============================================
export async function deleteProduct(productId: string) {
  try {
    if (!(await isAdmin())) {
      throw new Error("Unauthorized");
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // Collect all Cloudinary images to delete
    const imagesToDelete = [
      product.thumbnail,
      ...product.images,
    ].filter(Boolean);

    // Delete product from database
    await prisma.product.delete({
      where: { id: productId },
    });

    // Delete associated images from Cloudinary
    if (imagesToDelete.length > 0) {
      // Use background deletion to not block the response
      deleteMultipleImageFiles(imagesToDelete).catch((error) => {
        console.error("Failed to delete images from Cloudinary:", error);
      });
    }

    revalidatePath("/admin/products");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/subcategories");
    revalidatePath("/products");

    return { success: true, message: "Product deleted successfully" };
  } catch (error: any) {
    console.error("Delete product error:", error);
    throw new Error(error.message || "Failed to delete product");
  }
}

// ============================================
// ADMIN-ONLY: BULK DELETE PRODUCTS
// ============================================
export async function bulkDeleteProducts(productIds: string[]) {
  try {
    if (!(await isAdmin())) {
      throw new Error("Unauthorized");
    }

    if (!productIds || productIds.length === 0) {
      throw new Error("No products selected");
    }

    // Get all products to collect their images
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        thumbnail: true,
        images: true,
      },
    });

    // Collect all Cloudinary images to delete
    const allImagesToDelete: string[] = [];
    products.forEach((product) => {
      if (product.thumbnail) {
        allImagesToDelete.push(product.thumbnail);
      }
      if (product.images && product.images.length > 0) {
        allImagesToDelete.push(...product.images);
      }
    });

    // Delete products from database
    await prisma.product.deleteMany({
      where: {
        id: { in: productIds },
      },
    });

    // Delete associated images from Cloudinary (use bulk delete for efficiency)
    if (allImagesToDelete.length > 0) {
      // Use background bulk deletion
      bulkDeleteCloudinaryImages(allImagesToDelete).catch((error) => {
        console.error("Failed to bulk delete images from Cloudinary:", error);
      });
    }

    revalidatePath("/admin/products");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/subcategories");
    revalidatePath("/products");

    return {
      success: true,
      message: `${productIds.length} products deleted successfully`,
    };
  } catch (error: any) {
    console.error("Bulk delete error:", error);
    throw new Error(error.message || "Failed to delete products");
  }
}