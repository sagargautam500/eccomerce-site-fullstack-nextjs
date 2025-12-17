// src/components/ProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  categoryName?: string;
  subCategoryName?: string;
}

export default function ProductCard({
  product,
  categoryName,
  subCategoryName,
}: ProductCardProps) {
  const discountPercentage =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100
        )
      : 0;

const getImageSrc = (thumbnail: string) => {
  if (!thumbnail) return "/placeholder.png";
  // External URL
  if (thumbnail.startsWith("http")) return thumbnail;
  // Full local path: /uploads/products/file.jpg
  if (thumbnail.startsWith("/upload")) return thumbnail;
  // Only filename: product-123.jpg
  return `/products/${thumbnail}`;
};



  return (
    <Link href={`/products/${product.id}`}>
      <div className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer">
        {/* Product Image */}
        <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-gray-50">
          <Image
            src={getImageSrc(product.thumbnail)}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isFeatured && (
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Featured
              </span>
            )}
            {discountPercentage > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                -{discountPercentage}%
              </span>
            )}
            {product.stock === 0 && (
              <span className="bg-gray-800 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Sold Out
              </span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-3 space-y-1.5">
          {/* Category & Subcategory */}
          <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium uppercase tracking-wide">
            {categoryName && <span>{categoryName}</span>}
            {categoryName && subCategoryName && <span>•</span>}
            {subCategoryName && <span>{subCategoryName}</span>}
          </div>

          {/* Name */}
          <h3 className="font-medium text-sm text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors leading-tight">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs text-gray-700 font-medium">
                {product.rating}
              </span>
              {product.totalReviews && (
                <span className="text-xs text-gray-400">
                  ({product.totalReviews})
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-base font-bold text-gray-900">
              NPR {product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-xs line-through text-gray-400">
                NPR {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Stock Warning */}
          {product.stock > 0 && product.stock <= 5 && (
            <p className="text-[10px] text-orange-600 font-medium">
              Only {product.stock} left!
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
