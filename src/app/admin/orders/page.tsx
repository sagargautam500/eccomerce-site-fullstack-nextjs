// src/app/admin/orders/page.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  Search,
  Trash2,
  Eye,
  Package,
  ChevronLeft,
  ChevronRight,
  X as XIcon,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAllOrders, deleteOrder, bulkDeleteOrders } from "@/actions/admin/orderActions";
import { Order } from "@/types/order";

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get("userId") || undefined;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userIdFilter, setUserIdFilter] = useState<string | undefined>(initialUserId);
  const [sort, setSort] = useState<"newest" | "oldest" | "amount-high" | "amount-low">("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "amount-high", label: "Amount: High → Low" },
    { value: "amount-low", label: "Amount: Low → High" },
  ];

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "paid", label: "Paid" },
    { value: "pending", label: "Pending" },
    { value: "failed", label: "Failed" },
    { value: "expired", label: "Expired" },
    { value: "refunded", label: "Refunded" },
  ];

  // Sync userId from URL
  useEffect(() => {
    const uid = searchParams.get("userId");
    setUserIdFilter(uid || undefined);
    setPage(1);
  }, [searchParams]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch orders
  useEffect(() => {
    fetchOrders();
  }, [page, searchQuery, statusFilter, sort, userIdFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getAllOrders({
        page,
        limit: 10,
        search: searchQuery || undefined,
        userId: userIdFilter,
        status: statusFilter !== "all" ? statusFilter : undefined,
        sort,
      });

      if (result.success) {
        setOrders(result.orders as Order[]);
        setTotalPages(result.pagination.totalPages);
        setTotalProducts(result.pagination.total);
      } else {
        throw new Error("Failed to fetch orders");
      }
    } catch (err: any) {
      console.error("Fetch orders error:", err);
      setError(err.message || "Failed to load orders");
      toast.error("Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    startTransition(async () => {
      try {
        const result = await deleteOrder(id);
        toast.success(result.message || "Order deleted");
        setSelectedOrders((prev) => prev.filter((pid) => pid !== id));
        fetchOrders();
      } catch (err: any) {
        toast.error(err.message || "Failed to delete order");
      }
    });
  };

  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) {
      toast.error("No orders selected");
      return;
    }
    if (!confirm(`Delete ${selectedOrders.length} orders?`)) return;

    startTransition(async () => {
      try {
        const result = await bulkDeleteOrders(selectedOrders);
        toast.success(result.message || "Orders deleted");
        setSelectedOrders([]);
        fetchOrders();
      } catch (err: any) {
        toast.error(err.message || "Bulk delete failed");
      }
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((o) => o.id));
    }
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setStatusFilter("all");
    setUserIdFilter(undefined);
    setSort("newest");
    setPage(1);
  };

  const hasActiveFilters =
    searchQuery || statusFilter !== "all" || userIdFilter || sort !== "newest";

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // ✅ FULLY RESPONSIVE WRAPPER
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders</h1>
          {selectedOrders.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 text-sm whitespace-nowrap"
            >
              <Trash2 className="w-4 h-4" />
              Delete ({selectedOrders.length})
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by email, user ID, or order ID..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg min-w-[140px] focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as any);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg min-w-[160px] focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-1 whitespace-nowrap"
              >
                <XIcon className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>

          {/* Active Filter Badges */}
          {userIdFilter && (
            <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center gap-1">
                User ID filtered
                <button
                  onClick={() => setUserIdFilter(undefined)}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === orders.length && orders.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => toggleSelect(order.id)}
                        className="h-4 w-4"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-900">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{order.email}</div>
                      {order.userId && (
                        <div className="text-xs text-gray-500 mt-1">
                          User: {order.userId.slice(0, 8)}...
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          order.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        )}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {order.currency.toUpperCase()} {order.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/orders/${order.id}`}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(order.id)}
                          disabled={isPending}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {orders.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="font-medium">No orders found</p>
              <p className="text-sm mt-1">
                {hasActiveFilters ? "Try adjusting your filters" : "Orders will appear here"}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2 sm:mb-0">
                Page {page} of {totalPages} ({totalProducts} total orders)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}