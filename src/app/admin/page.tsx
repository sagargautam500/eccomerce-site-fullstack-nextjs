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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Import your existing server actions
import { getAllUsers } from "@/actions/admin/userActions";
import { getAllOrders } from "@/actions/admin/orderActions";
import { getAllProducts } from "@/actions/admin/productActions";

// Types (or import from your types files)
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

// Stats Card
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
  <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        <div className="flex items-center gap-1 mt-1">
          {changeType === "up" ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={cn("text-xs font-medium", changeType === "up" ? "text-green-600" : "text-red-600")}>
            {change}
          </span>
          <span className="text-xs text-gray-500">vs last month</span>
        </div>
      </div>
      <div className={cn("p-2.5 rounded-lg", color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

// Recent Order Row
const OrderRow = ({ order }: { order: Order }) => {
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

        // Fetch all data in parallel
        const [usersRes, ordersRes, productsRes] = await Promise.all([
          getAllUsers({ page: 1, limit: 1 }), // We only need total count
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
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        <p>{error}</p>
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
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <StatsCard key={idx} {...stat} />
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <p className="text-sm text-gray-500">Latest customer orders</p>
          </div>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            View All
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-md">
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
                recentOrders.map((order) => <OrderRow key={order.id} order={order} />)
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/products/add"
          className="bg-gradient-to-br from-orange-500 to-pink-500 text-white rounded-xl p-6 hover:shadow-lg transition-all block"
        >
          <Package className="w-8 h-8 mb-3" />
          <h3 className="font-bold text-lg">Add New Product</h3>
          <p className="text-sm text-white/90 mt-1">Create a new product listing</p>
        </Link>

        <Link
          href="/admin/orders"
          className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl p-6 hover:shadow-lg transition-all block"
        >
          <ShoppingCart className="w-8 h-8 mb-3" />
          <h3 className="font-bold text-lg">Manage Orders</h3>
          <p className="text-sm text-white/90 mt-1">View and process orders</p>
        </Link>

        <Link
          href="/admin/users"
          className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl p-6 hover:shadow-lg transition-all block"
        >
          <Users className="w-8 h-8 mb-3" />
          <h3 className="font-bold text-lg">User Management</h3>
          <p className="text-sm text-white/90 mt-1">Manage customer accounts</p>
        </Link>
      </div>
    </div>
  );
}