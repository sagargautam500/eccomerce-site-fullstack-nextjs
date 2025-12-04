// ==============================================
// src/app/wishlist/page.tsx
// ==============================================


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  Package,
  Loader2,
} from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

const WishlistPage = () => {
  const router = useRouter();
  const {
    getAllWishlistItems,
    removeFromWishlist,
    fetchWishlist,
    loading,
    isLoggedIn,
    setIsLoggedIn,
    getWishlistCount,
    guestWishlist,
    mergeGuestWishlist,
  } = useWishlistStore();

  const { addToCart } = useCartStore();
  const { data: session, status } = useSession();
  const [movingToCart, setMovingToCart] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isLoggedIn) {
      fetchWishlist();
    }
  }, [isLoggedIn]);

  // Handle auth state changes
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setIsLoggedIn(true);
     fetchWishlist().then(() => {
        // Merge guest wishlist after login
        if (guestWishlist.length > 0) {
          mergeGuestWishlist();
        }
      });
    } else if (status === "unauthenticated") {
      setIsLoggedIn(false);
    }
  }, [status, session, fetchWishlist, mergeGuestWishlist, guestWishlist.length, setIsLoggedIn]);


  // Prevent hydration errors
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const wishlistItems = getAllWishlistItems();
  const handleRemove = async (productId: string, isGuest: boolean) => {
    await removeFromWishlist(productId, isGuest);
  };

  const handleMoveToCart = async (item: any, isGuest: boolean) => {
    setMovingToCart(item.productId);

    try {
      const success = await addToCart({
        productId: item.productId,
        quantity: 1,
        product: item.product,
      });

      if (success) {
        await removeFromWishlist(item.productId, isGuest);
        toast.success("Moved to cart!");
      }
    } catch (error) {
      toast.error("Failed to move to cart");
    } finally {
      setMovingToCart(null);
    }
  };

  const handleMoveAllToCart = async () => {
    let movedCount = 0;

    for (const item of wishlistItems) {
      if (item.product.stock > 0) {
        const isGuest = item.id.startsWith("guest_");
        try {
          const success = await addToCart({
            productId: item.productId,
            quantity: 1,
            product: item.product,
          });

          if (success) {
            await removeFromWishlist(item.productId, isGuest);
            movedCount++;
          }
        } catch (error) {
          console.error("Failed to move item:", error);
        }
      }
    }

    if (movedCount > 0) {
      toast.success(
        `Moved ${movedCount} ${movedCount === 1 ? "item" : "items"} to cart!`
      );
    }
  };

  const calculateDiscount = (price: number, originalPrice?: number) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const calculateSavings = () => {
    return wishlistItems.reduce((total, item) => {
      const discount = item.product.originalPrice
        ? item.product.originalPrice - item.product.price
        : 0;
      return total + discount;
    }, 0);
  };

  if (loading && wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
          </div>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gray-100 rounded-full p-6">
                <Heart className="w-16 h-16 text-gray-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your Wishlist is Empty
            </h2>
            <p className="text-gray-600 mb-6">
              Start adding items you love to your wishlist!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all"
            >
              Browse Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalSavings = calculateSavings();
  const inStockCount = wishlistItems.filter(
    (item) => item.product.stock > 0
  ).length;

  const getImageSrc = (img: string) =>
    img?.startsWith("http") ? img : `/products/${img}`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            My Wishlist
          </h1>
          <p className="text-gray-600 mt-2">
            {getWishlistCount()}{" "}
            {getWishlistCount() === 1 ? "item" : "items"} in your wishlist
            {totalSavings > 0 && (
              <span className="ml-2 text-green-600 font-semibold">
                • Potential savings: NPR {totalSavings.toLocaleString()}
              </span>
            )}
          </p>
        </div>

        {/* Guest User Notice */}
        {!isLoggedIn && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-blue-800 text-sm font-medium">
                Browsing as Guest
              </p>
              <p className="text-blue-700 text-sm mt-1">
                Sign in to sync your wishlist across all your devices.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wishlist Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="divide-y divide-gray-200">
                {wishlistItems.map((item) => {
                  const isGuest = item.id.startsWith("guest_");
                  const discount = calculateDiscount(
                    item.product.price,
                    item.product.originalPrice
                  );

                  return (
                    <div
                      key={item.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex gap-6">
                        {/* Product Image */}
                        <Link
                          href={`/products/${item.productId}`}
                          className="flex-shrink-0"
                        >
                          <div className="w-32 h-32 relative bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={getImageSrc(item.product.thumbnail)}
                              alt={item.product.name}
                              fill
                              className="object-cover hover:scale-105 transition-transform"
                            />
                          </div>
                        </Link>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <Link
                                href={`/products/${item.productId}`}
                                className="text-lg font-semibold text-gray-900 hover:text-orange-600 transition-colors line-clamp-2"
                              >
                                {item.product.name}
                              </Link>
                              <p className="text-sm text-gray-500 mt-1">
                                {item.product.category.name}
                              </p>
                            </div>
                          </div>

                          {/* Price Section */}
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl font-bold text-gray-900">
                              NPR {item.product.price.toLocaleString()}
                            </span>
                            {item.product.originalPrice &&
                              item.product.originalPrice > item.product.price && (
                                <>
                                  <span className="text-lg text-gray-500 line-through">
                                    NPR{" "}
                                    {item.product.originalPrice.toLocaleString()}
                                  </span>
                                  {discount > 0 && (
                                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                                      {discount}% OFF
                                    </span>
                                  )}
                                </>
                              )}
                          </div>

                          {/* Stock Status */}
                          <div className="mb-4">
                            {item.product.stock > 0 ? (
                              <div className="flex items-center gap-2 text-green-600">
                                <Package className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  In Stock ({item.product.stock} available)
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-red-600">
                                <Package className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  Out of Stock
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => handleMoveToCart(item, isGuest)}
                              disabled={
                                item.product.stock === 0 ||
                                movingToCart === item.productId
                              }
                              className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium",
                                item.product.stock === 0
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : "bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600"
                              )}
                            >
                              {movingToCart === item.productId ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Moving...</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="w-4 h-4" />
                                  <span>Move to Cart</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() =>
                                handleRemove(item.productId, isGuest)
                              }
                              className="flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-lg border border-red-200 hover:bg-red-50 transition-colors text-sm font-medium"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Wishlist Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-semibold text-gray-900">
                    {getWishlistCount()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">In Stock:</span>
                  <span className="font-semibold text-green-600">
                    {inStockCount}
                  </span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-sm pt-3 border-t">
                    <span className="text-gray-600">Potential Savings:</span>
                    <span className="font-bold text-green-600">
                      NPR {totalSavings.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleMoveAllToCart}
                disabled={inStockCount === 0}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-3 rounded-lg hover:from-orange-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all font-medium mb-3"
              >
                Move All to Cart ({inStockCount})
              </button>

              <Link
                href="/products"
                className="block w-full text-center bg-white text-gray-700 px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
