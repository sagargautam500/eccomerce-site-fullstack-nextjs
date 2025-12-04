// src/app/orders/[id]/page.tsx
// NO "use client"

import Link from "next/link";
import Image from "next/image";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Mail,
  CreditCard,
  Receipt,
  Package,
  Download,
  ShoppingBag,
} from "lucide-react";
import { getOrderDetails } from "@/actions/api/orderApi"; // ✅ individual async function
import { Order } from "@/types/order";

// ✅ Next.js passes route params as props in Server Components
export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: orderId } = await params;

  let order: Order | null = null;
  let error: string | null = null;

  try {
    if (!orderId) throw new Error("Missing order ID");
    const data = await getOrderDetails(orderId);
    order = data.order;
  } catch (err: unknown) {
    console.error("Failed to fetch order:", err);
    error = "Failed to load order details";
  }

  const formatDate = (dateInput: string | Date) => {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      paid: "text-green-600 bg-green-50 border-green-200",
      pending: "text-yellow-600 bg-yellow-50 border-yellow-200",
      failed: "text-red-600 bg-red-50 border-red-200",
      expired: "text-gray-600 bg-gray-50 border-gray-200",
      refunded: "text-blue-600 bg-blue-50 border-blue-200",
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  // Error or not found
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-gray-900">
            Order Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "The order you're looking for doesn't exist."}
          </p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                order.status
              )}`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Order Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 pb-6 border-b border-gray-200">
            <Receipt className="w-6 h-6 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="font-mono text-lg font-semibold text-gray-900">
                #{order.id.slice(-12).toUpperCase()}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Order Date</p>
                <p className="text-gray-900 font-medium">
                  {formatDate(order.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="text-gray-900 font-medium">{order.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                <p className="text-gray-900 font-medium">{order.paymentMethod}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className="text-gray-900 font-medium">
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Amount Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-2">Total Amount</p>
              <p className="text-4xl font-bold text-gray-900">
                {order.currency.toUpperCase()} {order.amount.toLocaleString()}
              </p>
            </div>
            <Package className="w-16 h-16 text-green-600 opacity-20" />
          </div>
        </div>

        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Order Items ({order.items.length})
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  {item.images && item.images.length > 0 ? (
                    <Image
                      src={item.images[0]}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      NPR {item.price.toLocaleString()} × {item.quantity}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Subtotal</p>
                    <p className="font-bold text-gray-900">
                      NPR {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-green-600">
                  {order.currency.toUpperCase()} {order.amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Transaction IDs */}
        {(order.stripeCheckoutSession || order.esewaRefId || order.khaltiToken) && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Transaction Information
            </h2>
            <div className="space-y-3">
              {order.stripeCheckoutSession && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Stripe Checkout Session ID</p>
                  <p className="font-mono text-sm text-gray-900 break-all">
                    {order.stripeCheckoutSession}
                  </p>
                </div>
              )}
              {order.stripePaymentIntentId && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Stripe Payment Intent ID</p>
                  <p className="font-mono text-sm text-gray-900 break-all">
                    {order.stripePaymentIntentId}
                  </p>
                </div>
              )}
              {order.esewaRefId && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">eSewa Reference ID</p>
                  <p className="font-mono text-sm text-gray-900 break-all">
                    {order.esewaRefId}
                  </p>
                </div>
              )}
              {order.khaltiToken && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Khalti Token</p>
                  <p className="font-mono text-sm text-gray-900 break-all">
                    {order.khaltiToken}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          {order.status === "paid" && (
            <button className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium">
              <Download className="w-5 h-5" />
              Download Receipt
            </button>
          )}
          <Link
            href="/contact"
            className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition font-medium border border-gray-300"
          >
            Contact Support
          </Link>
        </div>

        {/* Status Help Text */}
        {order.status === "pending" && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              ⏳ <strong>Payment Pending:</strong> Your payment is being
              processed. This usually takes a few minutes. You&apos;ll receive an
              email confirmation once completed.
            </p>
          </div>
        )}

        {order.status === "failed" && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              ❌ <strong>Payment Failed:</strong> Your payment could not be
              processed. Please try again or contact support for assistance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}