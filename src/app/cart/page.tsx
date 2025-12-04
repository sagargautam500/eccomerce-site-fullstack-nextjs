"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  LogIn,
  Truck,
  Shield,
  RefreshCw,
  Loader2,
  User,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { CartItem } from "@/types/cartItem";

export default function CartPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [savingToWishlist, setSavingToWishlist] = useState<string | null>(null);

  // Cart Store
  const cart = useCartStore((s) => s.cart);
  const guestCart = useCartStore((s) => s.guestCart);
  const loading = useCartStore((s) => s.loading);
  const setIsLoggedIn = useCartStore((s) => s.setIsLoggedIn);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const mergeGuestCart = useCartStore((s) => s.mergeGuestCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const getCartTotal = useCartStore((s) => s.getCartTotal);
  const getCartItemsCount = useCartStore((s) => s.getCartItemsCount);
  const getAllCartItems = useCartStore((s) => s.getAllCartItems);

  // Wishlist Store
  const { addToWishlist, isInWishlist } = useWishlistStore();

  // Initialize
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle auth state changes
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setIsLoggedIn(true);
      fetchCart().then(() => {
        // Merge guest cart after login
        if (guestCart.length > 0) {
          mergeGuestCart();
        }
      });
    } else if (status === "unauthenticated") {
      setIsLoggedIn(false);
    }
  }, [status, session, fetchCart, mergeGuestCart, guestCart.length, setIsLoggedIn]);

  // Loading
  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  // Get active cart items
  const cartItems = getAllCartItems();
  const subtotal = getCartTotal();
  const shipping = subtotal >= 5000 ? 0 : subtotal > 0 ? 100 : 0;
  const total = subtotal + shipping;
  const itemsCount = getCartItemsCount();
  const isUserLoggedIn = status === "authenticated";

  // Loading cart data
  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-12 h-12 text-gray-300" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h1>
          <p className="text-gray-500 mb-6">Start shopping to add items to your cart</p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all"
          >
            <ShoppingBag className="w-5 h-5" />
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // Update quantity handler
  const handleUpdateQty = async (itemId: string, newQty: number) => {
    const isGuestItem = itemId.startsWith("guest_");
    setUpdatingId(itemId);
    await updateQuantity(itemId, newQty, isGuestItem);
    setUpdatingId(null);
  };

  // Remove handler
  const handleRemove = async (itemId: string) => {
    const isGuestItem = itemId.startsWith("guest_");
    await removeFromCart(itemId, isGuestItem);
  };

  // Save to wishlist (move from cart to wishlist)
  const handleSaveForLater = async (item: CartItem) => {
    if (!item.product) return;

    setSavingToWishlist(item.id);

    try {
      // Check if already in wishlist
      if (isInWishlist(item.productId)) {
        toast.info("Already in your wishlist!");
        // Remove from cart anyway
        const isGuestItem = item.id.startsWith("guest_");
        await removeFromCart(item.id, isGuestItem);
        setSavingToWishlist(null);
        return;
      }
      // Add to wishlist
      const success = await addToWishlist({
        productId: item.productId,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          originalPrice: item.product.originalPrice,
          thumbnail: item.product.thumbnail,
          stock: item.product.stock,
          category: item.product.category,
        },
      });

      if (success) {
        // Remove from cart after adding to wishlist
        const isGuestItem = item.id.startsWith("guest_");
        await removeFromCart(item.id, isGuestItem);
        toast.success("Moved to wishlist!");
      }
    } catch (error) {
      console.error("Save for later error:", error);
      toast.error("Failed to save for later");
    } finally {
      setSavingToWishlist(null);
    }
  };

  // Get image source
  const getImageSrc = (thumbnail?: string) => {
    if (!thumbnail) return "/placeholder.png";
    return thumbnail.startsWith("http") ? thumbnail : `/products/${thumbnail}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-16 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 text-sm font-medium mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-gray-500 text-sm mt-1">{itemsCount} items</p>
            </div>

            {/* User Status */}
            {isUserLoggedIn ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm">
                <User className="w-4 h-4" />
                <span className="font-medium">{session?.user?.name || "Logged In"}</span>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm hover:bg-orange-200 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="font-medium">Sign in to save cart</span>
              </Link>
            )}
          </div>
        </div>

        {/* Guest Banner */}
        {!isUserLoggedIn && cartItems.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl p-4 text-white">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <LogIn className="w-8 h-8 flex-shrink-0" />
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-bold">Sign in for a better experience</h3>
                <p className="text-sm text-white/90">Save your cart, track orders & checkout faster!</p>
              </div>
              <Link
                href="/auth/signin"
                className="px-5 py-2 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const inWishlist = isInWishlist(item.productId);

              return (
                <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 flex gap-4">
                  {/* Image */}
                  <Link href={`/products/${item.productId}`} className="flex-shrink-0">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={getImageSrc(item.product?.thumbnail)}
                        alt={item.product?.name || "Product"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 uppercase">{item.product?.category?.name}</p>
                        <Link
                          href={`/products/${item.productId}`}
                          className="font-semibold text-gray-900 hover:text-orange-600 line-clamp-1 text-sm sm:text-base"
                        >
                          {item.product?.name}
                        </Link>

                        {/* Variants */}
                        <div className="flex gap-2 mt-1 flex-wrap">
                          {item.size && (
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                              Size: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                              Color: {item.color}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors h-fit"
                        title="Remove from cart"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quantity & Price */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          disabled={item.quantity <= 1 || updatingId === item.id}
                          onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                          className="p-1.5 hover:bg-gray-100 disabled:opacity-40"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-1.5 text-sm font-semibold min-w-[2.5rem] text-center bg-gray-50">
                          {updatingId === item.id ? "..." : item.quantity}
                        </span>
                        <button
                          disabled={item.quantity >= (item.product?.stock || 99) || updatingId === item.id}
                          onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                          className="p-1.5 hover:bg-gray-100 disabled:opacity-40"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="font-bold text-gray-900">
                        NPR {((item.product?.price || 0) * item.quantity).toLocaleString()}
                      </p>
                    </div>

                    {/* Actions: Save for Later / Low Stock */}
                    <div className="flex items-center justify-between mt-3">
                      {/* Save for Later Button */}
                      <button
                        onClick={() => handleSaveForLater(item)}
                        disabled={savingToWishlist === item.id}
                        className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-red-500 font-medium transition-colors disabled:opacity-50"
                      >
                        {savingToWishlist === item.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Heart className={`w-3.5 h-3.5 ${inWishlist ? "fill-red-500 text-red-500" : ""}`} />
                            <span>{inWishlist ? "In Wishlist" : "Save for Later"}</span>
                          </>
                        )}
                      </button>

                      {/* Low stock warning */}
                      {item.product?.stock && item.product.stock <= 5 && (
                        <p className="text-xs text-orange-600">Only {item.product.stock} left!</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">NPR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `NPR ${shipping}`
                    )}
                  </span>
                </div>

                {/* Free shipping progress */}
                {subtotal > 0 && subtotal < 5000 && (
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-orange-700">Free shipping at NPR 5,000</span>
                      <span className="text-orange-600">{Math.round((subtotal / 5000) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-orange-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"
                        style={{ width: `${Math.min((subtotal / 5000) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-orange-600 mt-1">
                      Add NPR {(5000 - subtotal).toLocaleString()} more
                    </p>
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-gray-900">
                      NPR {total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              {isUserLoggedIn ? (
                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full mt-5 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all"
                >
                  Checkout <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <Link
                  href="/auth/signin"
                  className="w-full mt-5 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all"
                >
                  <LogIn className="w-5 h-5" />
                  Login to Checkout
                </Link>
              )}

              <Link
                href="/products"
                className="block text-center mt-3 text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                Continue Shopping
              </Link>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2 mt-5 pt-5 border-t">
                <div className="text-center">
                  <Truck className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-[10px] text-gray-500">Free Ship</p>
                </div>
                <div className="text-center">
                  <Shield className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-[10px] text-gray-500">Secure</p>
                </div>
                <div className="text-center">
                  <RefreshCw className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-[10px] text-gray-500">Returns</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}