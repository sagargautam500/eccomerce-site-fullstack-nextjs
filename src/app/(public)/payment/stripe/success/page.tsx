// src/app/success/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, AlertCircle, Package, Receipt } from "lucide-react";
import { verifyPayment } from "@/actions/api/paymentApi"; // ← Import the Server Action
import { Order } from "@/types/order";

function SuccessContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found in the URL");
      setLoading(false);
      return;
    }

    // Call the Server Action safely
    const verifyAndFetchOrder = async () => {
      try {
        // This is a Server Action → Next.js automatically handles it via POST
        const result = await verifyPayment(sessionId);

        // result is { order: Order }
        setOrderDetails(result.order);
      } catch (err: any) {
        console.error("Payment verification failed:", err);

        // Handle known error shapes (from your API route)
        const message =
          err?.message ||
          err?.error ||
          "Failed to verify payment. Please contact support.";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    verifyAndFetchOrder();
  }, [sessionId]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
        <p className="text-gray-600 text-lg">Verifying your payment...</p>
      </div>
    );
  }

  // ── Error ──
  if (error || !orderDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-center px-4">
        <AlertCircle className="text-red-600 w-16 h-16 mb-4" />
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Payment Verification Failed</h1>
        <p className="text-gray-700 mb-6 max-w-md">
          {error}
        </p>
        {sessionId && (
          <p className="text-sm text-gray-600 mb-6 font-mono bg-gray-100 px-4 py-2 rounded">
            Session ID: {sessionId}
          </p>
        )}
        <div className="flex gap-4">
          <Link href="/" className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition">
            Go Home
          </Link>
          <Link href="/contact" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition">
            Contact Support
          </Link>
        </div>
      </div>
    );
  }

  // ── Success ──
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 rounded-full p-4">
            <CheckCircle2 className="text-green-600 w-16 h-16" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2 text-center text-gray-900">
          Payment Successful!
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Thank you for your purchase. Your order has been confirmed.
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
          <div className="flex items-start gap-3">
            <Receipt className="w-5 h-5 text-gray-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="font-mono text-sm font-medium text-gray-900">{orderDetails.id}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-gray-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Amount Paid</p>
              <p className="text-2xl font-bold text-gray-900">
                {orderDetails.currency.toUpperCase()} {orderDetails.amount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Status</p>
              <span className="inline-block bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                {orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            A confirmation email has been sent to <strong>{orderDetails.email}</strong>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition text-center font-medium"
          >
            Continue Shopping
          </Link>
          <Link
            href="/orders"
            className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition text-center font-medium border border-gray-300"
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}