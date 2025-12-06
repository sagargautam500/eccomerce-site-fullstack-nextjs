// src/app/payment/esewa/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import { Loader2, CheckCircle2, AlertCircle, ShoppingBag, Package, Receipt, Calendar, Mail, Smartphone } from "lucide-react";
import { Order } from "@/types/order";

interface EsewaResponse {
  transaction_code?: string;
  status?: string;
  total_amount?: string;
  transaction_uuid?: string;
  product_code?: string;
  signed_field_names?: string;
  signature?: string;
}



export default function EsewaSuccessPage() {
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<Order|null>(null);
  const [transactionCode, setTransactionCode] = useState<string>("");

  useEffect(() => {
    const verifyEsewaPayment = async () => {
      try {
        // Get the full URL to parse properly
        const fullUrl = window.location.href;
        // console.log("Full URL:", fullUrl);

        // Extract data parameter manually (eSewa appends it with ?)
        const dataMatch = fullUrl.match(/[?&]data=([^&]+)/);
        const data = dataMatch ? dataMatch[1] : null;

        // console.log("eSewa Success Page - Data:", data);

        // Parse the data if it exists (eSewa sends base64 encoded JSON)
        let esewaResponse: EsewaResponse = {};
        let orderId = "";

        if (data) {
          try {
            const decodedData = atob(data);
            console.log("Decoded data:", decodedData);
            esewaResponse = JSON.parse(decodedData);
            orderId = esewaResponse.transaction_uuid || "";
            // console.log("Extracted orderId:", orderId);
          } catch (e) {
            console.error("Failed to decode base64 data:", e);
            throw new Error("Invalid payment response data");
          }
        }

        // Check if we have required data
        if (!orderId) {
          throw new Error("Order ID not found in response");
        }

        // Check payment status
        const status = esewaResponse.status?.toUpperCase();
        const txnCode = esewaResponse.transaction_code;
        const amount = esewaResponse.total_amount;

        // console.log("Payment Status:", status);
        // console.log("Transaction Code:", txnCode);

        if (status !== "COMPLETE") {
          throw new Error(`Payment not completed. Status: ${status}`);
        }

        // Verify payment on backend
        const verifyResponse = await axiosInstance.post<{ order: Order }>(
          "/api/payment/esewa/verify",
          {
            orderId: orderId,
            refId: txnCode || "N/A",
            transactionCode: txnCode,
            status: status,
            amount: amount,
            uuid: esewaResponse.transaction_uuid,
          }
        );

        // console.log("Verification response:", verifyResponse.data);

        // Set order details
        setOrderDetails(verifyResponse.data.order);
        setTransactionCode(txnCode || "");
        setVerifying(false);
      } catch (err: unknown) {
        console.error("Payment verification error:", err);
        const errorResponse = err as { response?: { data?: { error?: string } }; message?: string };
        setError(
          errorResponse.response?.data?.error ||
            errorResponse.message ||
            "Payment verification failed"
        );
        setVerifying(false);
      }
    };

    verifyEsewaPayment();
  }, []);

  // Loading state
  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-16 h-16 text-green-600 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-gray-900">
            Verifying Payment
          </h1>
          <p className="text-gray-600">
            Please wait while we verify your eSewa payment...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-gray-900">
            Payment Verification Failed
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "Unable to verify your payment. Please contact support."}
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/cart"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
            >
              Back to Cart
            </Link>
            <Link
              href="/orders"
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition font-medium border border-gray-300"
            >
              View Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Success state
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Icon */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold mb-2 text-center text-gray-900">
            Payment Successful! 🎉
          </h1>
          <p className="text-gray-600 text-center mb-2">
            Your eSewa payment has been verified and confirmed.
          </p>
          <p className="text-sm text-gray-500 text-center">
            Thank you for your purchase!
          </p>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Payment Details
          </h2>
          
          <div className="space-y-4">
            {/* Order ID */}
            <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
              <Package className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Order ID</p>
                <p className="font-mono text-sm font-semibold text-gray-900">
                  #{orderDetails.id.slice(-12).toUpperCase()}
                </p>
              </div>
            </div>

            {/* Transaction Code */}
            {transactionCode && (
              <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
                <Receipt className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">eSewa Transaction ID</p>
                  <p className="font-mono text-sm font-semibold text-green-600">
                    {transactionCode}
                  </p>
                </div>
              </div>
            )}

            {/* Date */}
            <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Payment Date</p>
                <p className="text-gray-900 font-medium">
                  {formatDate(orderDetails.createdAt.toString())}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="text-gray-900 font-medium">{orderDetails.email}</p>
              </div>
            </div>

            {/* Amount */}
            <div className="flex items-start gap-3 pt-2">
              <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
                <p className="text-3xl font-bold text-green-600">
                  {orderDetails.currency.toUpperCase()} {orderDetails.amount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method Badge */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Paid via</p>
              <p className="text-2xl font-bold">eSewa</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <Smartphone className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Confirmation Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800">
            📧 <strong>Confirmation email sent!</strong> A payment receipt has been sent to{" "}
            <strong>{orderDetails.email}</strong>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Link
            href="/"
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-xl hover:from-green-700 hover:to-green-800 transition text-center font-bold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            Continue Shopping
          </Link>
          <Link
            href="/orders"
            className="flex-1 bg-white text-gray-700 px-6 py-4 rounded-xl hover:bg-gray-50 transition text-center font-bold border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center gap-2 shadow-md"
          >
            <Package className="w-5 h-5" />
            View Orders
          </Link>
        </div>

        {/* Support Info */}
        <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
          <p className="text-sm text-gray-600">
            Need help? <Link href="/contact" className="text-green-600 hover:text-green-700 font-medium">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}