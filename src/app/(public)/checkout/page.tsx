"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingBag,
  MapPin,
  Truck,
  Shield,
  Loader2,
  LogIn,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  // Cart store
  const cart = useCartStore((s) => s.cart);
  const loading = useCartStore((s) => s.loading);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const getCartTotal = useCartStore((s) => s.getCartTotal);
  const getCartItemsCount = useCartStore((s) => s.getCartItemsCount);

  useEffect(() => {
    setMounted(true);
    if (session?.user) {
      fetchCart();
    }
  }, [session, fetchCart]);

  // Loading
  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  // Not logged in
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-10 h-10 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h1>
          <p className="text-gray-500 mb-6">Please login to proceed with checkout</p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all"
          >
            <LogIn className="w-5 h-5" />
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Empty cart
  if (cart.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-12 h-12 text-gray-300" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h1>
          <p className="text-gray-500 mb-6">Add some items to proceed with checkout</p>
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

  // Prepare data
  const subtotal = getCartTotal();
  const shipping = subtotal >= 5000 ? 0 : 100;
  const total = subtotal + shipping;
  const itemsCount = getCartItemsCount();

  // Prepare items for payment
  const checkoutItems = cart.map((item) => ({
    productId: item.productId,
    name: item.product?.name || "Product",
    price: item.product?.price || 0,
    quantity: item.quantity,
    size: item.size,
    color: item.color,
    thumbnail: item.product?.thumbnail,
  }));

  // Current user
  const currentUser = {
    id: session.user.id || "",
    email: session.user.email || "",
    name: session.user.name || "",
  };
  // Get image source
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
    <div className="min-h-screen mt-4 bg-gray-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 text-sm font-medium mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-500 text-sm mt-1">{itemsCount} items</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  Shipping Address
                </h2>
                <button className="text-orange-600 text-sm font-medium hover:text-orange-700">
                  Change
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold text-gray-900">{session.user.name || "User"}</p>
                <p className="text-gray-600 text-sm mt-1">{session.user.email}</p>
                <p className="text-gray-500 text-sm mt-1">
                  Please add your shipping address in profile settings
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-500" />
                Order Items
              </h2>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    {/* Image */}
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={getImageSrc(item.product?.thumbnail)}
                        alt={item.product?.name || "Product"}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 line-clamp-1">
                        {item.product?.name}
                      </p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {item.size && (
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {item.color}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <p className="font-bold text-gray-900">
                      NPR {((item.product?.price || 0) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-500" />
                Delivery
              </h2>
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <Truck className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">
                    {shipping === 0 ? "Free Delivery" : `Standard Delivery - NPR ${shipping}`}
                  </p>
                  <p className="text-sm text-green-600">Estimated 3-5 business days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Payment */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-24">
              {/* Order Summary */}
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({itemsCount} items)</span>
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
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-gray-900">
                      NPR {total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <PaymentMethodSelector items={checkoutItems} user={currentUser} />

              {/* Security */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}