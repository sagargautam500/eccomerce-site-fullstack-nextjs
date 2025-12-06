// src/app/orders/page.tsx
// NO "use client"

import Link from "next/link";
import {
  AlertCircle,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Mail,
  ArrowLeft,
  Receipt,
} from "lucide-react";
import { Order } from "@/types/order";
import { auth } from "@/auth"; // Assuming you're using NextAuth v5 (App Router)
import { getOrders } from "@/actions/api/orderApi";

export default async function OrdersPage() {
  const session = await auth();
  const userId = session?.user?.id;

  let orders: Order[] = [];
  let error: string | null = null;

  if (!userId) {
    error = "You must be signed in to view orders.";
  } else {
    try {
      const data = await getOrders(userId);
      orders = data.orders;
    } catch (err: unknown) {
      console.error("Failed to fetch orders:", err);
      error = "Failed to load orders";
    }
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-gray-900">
            Failed to Load Orders
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="bg-gray-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">
            No Orders Yet
          </h1>
          <p className="text-gray-600 mb-6">
            You haven&apos;t placed any orders yet. Start shopping to see your orders here!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Helper functions (now just plain functions, no hooks)
  const getStatusBadge = (status: string) => {
    const styles = {
      paid: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      failed: "bg-red-100 text-red-800 border-red-200",
      expired: "bg-gray-100 text-gray-800 border-gray-200",
      refunded: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="w-4 h-4" />;
      case "failed":
        return <XCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
          <p className="text-gray-600 mt-2">
            View and manage your order history
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Receipt className="w-5 h-5 text-gray-400" />
                    <span className="font-mono text-sm text-gray-600">
                      Order #{order.id.slice(-8).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {order.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                    <span className="text-sm text-gray-600 bg-green-100 rounded-full px-3 py-1 border-green-400">
                      {order.paymentMethod}
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <div className="flex items-center justify-between md:justify-end gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {order.currency.toUpperCase()}{" "}
                      {order.amount.toLocaleString()}
                    </p>
                  </div>
                  <Link
                    href={`/orders/${order.id}`}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-medium whitespace-nowrap"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Order Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">
                {orders.length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Orders</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {orders.filter((o) => o.status === "paid").length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Completed</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {orders.filter((o) => o.status === "pending").length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Pending</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                NPR{" "}
                {orders
                  .filter((o) => o.status === "paid")
                  .reduce((sum, o) => sum + o.amount, 0)
                  .toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Spent</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}