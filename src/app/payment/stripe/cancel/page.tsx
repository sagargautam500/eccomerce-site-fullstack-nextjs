// src/app/cancel/page.tsx
"use client";

import Link from "next/link";
import { XCircle, ArrowLeft, ShoppingCart } from "lucide-react";

export default function CancelPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-red-50 px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-orange-100 rounded-full p-4">
            <XCircle className="text-orange-600 w-16 h-16" />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold mb-2 text-gray-900">
          Payment Cancelled
        </h1>
        <p className="text-gray-600 mb-8">
          Your payment was cancelled. No charges were made to your account.
        </p>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-blue-800">
            💡 <strong>Your cart items are still saved!</strong> You can complete your purchase anytime.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link
            href="/cart"
            className="flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition font-medium"
          >
            <ShoppingCart className="w-5 h-5" />
            Return to Cart
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition font-medium border border-gray-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}