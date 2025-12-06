// src/app/payment/khalti/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { getOrderDetails } from "@/actions/api/orderApi";

function KhaltiPaymentContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [error, setError] = useState<string | null>(null);
  // const [loading, setLoading] = useState(true); // Removed unused loading state

  useEffect(() => {
    if (!orderId) {
      setError("Order ID not found");
      return;
    }

    const initiateKhaltiPayment = async () => {
      try {
        // Fetch order details
         const orderData=await getOrderDetails(orderId);
        const order = orderData.order;

        // console.log("Order details:", order);

        // Initiate Khalti payment
        const { data: paymentData } = await axiosInstance.post<{ payment_url: string }>(
          "/api/payment/khalti/initiate",
          {
            orderId,
            amount: order.amount,
            email: order.email,
          }
        );

        // console.log("Khalti initiate response:", paymentData);

        // Redirect to Khalti payment URL
        if (paymentData.payment_url) {
          window.location.href = paymentData.payment_url;
        } else {
          throw new Error("No payment URL received from Khalti");
        }
      } catch (err: unknown) {
        console.error("Khalti payment error:", err);
        const errorResponse = err as { response?: { data?: { error?: string } } };
        setError(
          errorResponse.response?.data?.error || "Failed to initiate Khalti payment"
        );
      }
    };

    initiateKhaltiPayment();
  }, [orderId]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-gray-900">
            Payment Error
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/cart"
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
          >
            Back to Cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center">
        {/* Animated Khalti logo placeholder */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
            <span className="text-white text-2xl font-bold">K</span>
          </div>
        </div>

        {/* Animated loader */}
        <div className="mb-6">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 border-r-purple-500 rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-3 text-gray-900">
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Redirecting to Khalti
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 text-lg mb-6">
          Please wait while we redirect you to Khalti payment gateway
          <span className="inline-block ml-1">
            <span className="animate-bounce" style={{ animationDelay: "0ms" }}>
              .
            </span>
            <span className="animate-bounce" style={{ animationDelay: "150ms" }}>
              .
            </span>
            <span className="animate-bounce" style={{ animationDelay: "300ms" }}>
              .
            </span>
          </span>
        </p>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <span>Secure payment processing</span>
        </div>
      </div>
    </div>
  );
}

export default function KhaltiPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    }>
      <KhaltiPaymentContent />
    </Suspense>
  );
}