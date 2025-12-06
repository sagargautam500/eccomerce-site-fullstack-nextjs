// src/app/payment/esewa/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { getOrderDetails } from "@/actions/api/orderApi";

function EsewaPaymentContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [error, setError] = useState<string | null>(null);
  // const [loading, setLoading] = useState(true); // Removed unused loading state

  useEffect(() => {
    if (!orderId) {
      setError("Order ID not found");
      return;
    }

    const initiateEsewaPayment = async () => {
      try {
        // Fetch order details
       const orderData=await getOrderDetails(orderId);
        const order = orderData.order;

        console.log("Order details:", order);

        // Get signature from backend
        const { data: signatureData } = await axiosInstance.post<{ signature: string }>(
          "/api/payment/esewa/signature",
          {
            totalAmount: order.amount,
            transactionUUID: orderId,
            productCode: "EPAYTEST",
          }
        );

        const signature = signatureData.signature;
        // console.log("Signature received:", signature);

        // eSewa form configuration
        const esewaConfig = {
          amount: order.amount.toString(),
          total_amount: order.amount.toString(),
          tax_amount: "0",
          transaction_uuid: orderId,
          product_code: "EPAYTEST",
          product_service_charge: "0",
          product_delivery_charge: "0",
          success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/esewa/success`,
          failure_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/esewa/failure?orderId=${orderId}`,
          signed_field_names: "total_amount,transaction_uuid,product_code",
          signature: signature,
        };


        // Create and submit form
        const form = document.createElement("form");
        form.method = "POST";
        form.action =
          process.env.NEXT_PUBLIC_ESEWA_URL || "https://uat.esewa.com.np/epay/main";

        Object.entries(esewaConfig).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });

        console.log("Form created, submitting to:", form.action);
        document.body.appendChild(form);
        form.submit();
      } catch (err: unknown) {
        console.error("eSewa payment error:", err);

        const errorResponse = err as { 
          response?: { data?: { error?: string } }; 
          request?: unknown; 
          message?: string 
        };
        
        if (errorResponse.response) {
          console.error("Response data:", errorResponse.response.data);
          setError(errorResponse.response.data?.error || "Failed to initiate payment");
        } else if (errorResponse.request) {
          console.error("No response:", errorResponse.request);
          setError("No response from server");
        } else {
          console.error("Error message:", errorResponse.message);
          setError(errorResponse.message || "Failed to initiate eSewa payment");
        }
      }
    };

    initiateEsewaPayment();
  }, [orderId]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-gray-900">
            Payment Error
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/cart"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            Back to Cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
            <span className="text-white text-2xl font-bold">eS</span>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-green-500 border-r-green-500 rounded-full animate-spin"></div>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-3 text-gray-900">
          <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Redirecting to eSewa
          </span>
        </h1>

        <p className="text-gray-600 text-lg mb-6">
          Please wait while we redirect you to eSewa payment gateway
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

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Secure payment processing</span>
        </div>
      </div>
    </div>
  );
}

export default function EsewaPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    }>
      <EsewaPaymentContent />
    </Suspense>
  );
}