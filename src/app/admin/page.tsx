// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Loader2,
  Plus,
  Eye,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Import your existing server actions
import { getAllUsers } from "@/actions/admin/userActions";
import { getAllOrders } from "@/actions/admin/orderActions";
import { getAllProducts } from "@/actions/admin/productActions";

// Types
interface Order {
  id: string;
  email: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed" | "expired" | "refunded";
  createdAt: string;
  items: any[];
}

interface Product {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
}

// Stats Card - Made Responsive
const StatsCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  change: string;
  changeType: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) => (
  <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 hover:shadow-md transition-all">
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm text-gray-600 truncate">{title}</p>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 truncate">{value}</h3>
        <div className="flex items-center gap-1 mt-1 flex-wrap">
          {changeType === "up" ? (
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
          ) : (
            <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" />
          )}
          <span className={cn("text-xs font-medium", changeType === "up" ? "text-green-600" : "text-red-600")}>
            {change}
          </span>
          <span className="text-xs text-gray-500 hidden sm:inline">vs last month</span>
        </div>
      </div>
      <div className={cn("p-2 sm:p-2.5 rounded-lg flex-shrink-0", color)}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
    </div>
  </div>
);

// Mobile Order Card
const OrderCardMobile = ({ order }: { order: Order }) => {
  const statusMap: Record<string, { label: string; className: string }> = {
    paid: { label: "Paid", className: "bg-green-100 text-green-800" },
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
    failed: { label: "Failed", className: "bg-red-100 text-red-800" },
    expired: { label: "Expired", className: "bg-gray-100 text-gray-800" },
    refunded: { label: "Refunded", className: "bg-blue-100 text-blue-800" },
  };

  const status = statusMap[order.status] || { label: "Unknown", className: "bg-gray-100 text-gray-800" };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono text-gray-500 mb-1">
            #{order.id.slice(0, 8)}...
          </p>
          <p className="text-sm font-semibold text-gray-900 truncate">
            {order.email}
          </p>
        </div>
        <span className={cn("px-2 py-1 text-xs rounded-full font-medium whitespace-nowrap", status.className)}>
          {status.label}
        </span>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-600 truncate flex-1">
          {order.items?.[0]?.name || `${order.items?.length || 0} item(s)`}
        </div>
        <div className="font-bold text-gray-900 ml-2">
          {order.currency.toUpperCase()} {order.amount.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

// Desktop Order Row
const OrderRowDesktop = ({ order }: { order: Order }) => {
  const statusMap: Record<string, { label: string; className: string }> = {
    paid: { label: "Paid", className: "bg-green-100 text-green-800" },
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
    failed: { label: "Failed", className: "bg-red-100 text-red-800" },
    expired: { label: "Expired", className: "bg-gray-100 text-gray-800" },
    refunded: { label: "Refunded", className: "bg-blue-100 text-blue-800" },
  };

  const status = statusMap[order.status] || { label: "Unknown", className: "bg-gray-100 text-gray-800" };

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3 text-sm font-mono text-gray-900">{order.id.slice(0, 8)}...</td>
      <td className="px-4 py-3 text-sm text-gray-600">{order.email}</td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {order.items?.[0]?.name || `${order.items?.length || 0} item(s)`}
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
        {order.currency.toUpperCase()} {order.amount.toLocaleString()}
      </td>
      <td className="px-4 py-3">
        <span className={cn("px-2 py-1 text-xs rounded-full font-medium", status.className)}>
          {status.label}
        </span>
      </td>
    </tr>
  );
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [usersRes, ordersRes, productsRes] = await Promise.all([
          getAllUsers({ page: 1, limit: 1 }),
          getAllOrders({ page: 1, limit: 5, sort: "newest" }),
          getAllProducts({ page: 1, limit: 1 }),
        ]);

        const totalUsers = usersRes.pagination?.total || 0;
        const totalOrders = ordersRes.pagination?.total || 0;
        const totalProducts = productsRes.pagination?.total || 0;
        const totalRevenue = ordersRes.orders
          .filter((o: any) => o.status === "paid")
          .reduce((sum: number, o: any) => sum + o.amount, 0);

        setStats({
          totalUsers,
          totalOrders,
          totalProducts,
          totalRevenue,
        });

        setRecentOrders(
          ordersRes.orders.map((order) => ({
            ...order,
            createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
          })) as Order[]
        );
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data");
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-orange-500 animate-spin mx-auto" />
          <p className="text-gray-600 mt-3 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-red-600 text-sm sm:text-base">{error}</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `NPR ${stats.totalRevenue.toLocaleString()}`,
      change: "+12.5%",
      changeType: "up" as const,
      icon: DollarSign,
      color: "bg-gradient-to-br from-green-500 to-emerald-600",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      change: "+8.2%",
      changeType: "up" as const,
      icon: ShoppingCart,
      color: "bg-gradient-to-br from-blue-500 to-indigo-600",
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      change: "+3.1%",
      changeType: "up" as const,
      icon: Package,
      color: "bg-gradient-to-br from-orange-500 to-pink-600",
    },
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: "-2.4%",
      changeType: "down" as const,
      icon: Users,
      color: "bg-gradient-to-br from-purple-500 to-pink-600",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm sm:text-base">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {statCards.map((stat, idx) => (
          <StatsCard key={idx} {...stat} />
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Recent Orders</h2>
            <p className="text-xs sm:text-sm text-gray-500">Latest customer orders</p>
          </div>
          <Link
            href="/admin/orders"
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
          >
            View All
            <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </Link>
        </div>

        {/* Mobile View - Cards */}
        <div className="lg:hidden p-4 space-y-3">
          {recentOrders.length > 0 ? (
            recentOrders.map((order) => <OrderCardMobile key={order.id} order={order} />)
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              No recent orders
            </div>
          )}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => <OrderRowDesktop key={order.id} order={order} />)
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No recent orders
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <Link
          href="/admin/products/add"
          className="bg-gradient-to-br from-orange-500 to-pink-500 text-white rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all block group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <Plus className="w-5 h-5 opacity-80" />
          </div>
          <h3 className="font-bold text-base sm:text-lg">Add New Product</h3>
          <p className="text-xs sm:text-sm text-white/90 mt-1">Create a new product listing</p>
        </Link>

        <Link
          href="/admin/orders"
          className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all block group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <Eye className="w-5 h-5 opacity-80" />
          </div>
          <h3 className="font-bold text-base sm:text-lg">Manage Orders</h3>
          <p className="text-xs sm:text-sm text-white/90 mt-1">View and process orders</p>
        </Link>

        <Link
          href="/admin/users"
          className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all block group sm:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <Eye className="w-5 h-5 opacity-80" />
          </div>
          <h3 className="font-bold text-base sm:text-lg">User Management</h3>
          <p className="text-xs sm:text-sm text-white/90 mt-1">Manage customer accounts</p>
        </Link>
      </div>
    </div>
  );
}