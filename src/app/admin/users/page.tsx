"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
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
  Edit,
} from "lucide-react";
import {
  getAllUsers,
  deleteUser,
  bulkDeleteUsers,
} from "@/actions/admin/userActions";
import { User } from "@/types/user";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "name">("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "name", label: "Name: A → Z" },
  ];

  const roleOptions = [
    { value: "all", label: "All Roles" },
    { value: "admin", label: "Admin" },
    { value: "user", label: "User" },
  ];

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, [page, searchQuery, roleFilter, sort]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await getAllUsers({
        page,
        limit: 10,
        search: searchQuery || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
        sort,
      });

      if (result.success) {
        setUsers(result.users as User[]);
        setTotalPages(result.pagination.totalPages);
        setTotalUsers(result.pagination.total);
      }
    } catch (err: any) {
      console.error("Fetch users error:", err);
      toast.error("Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    startTransition(async () => {
      try {
        await deleteUser(id);
        toast.success("User deleted");
        setSelectedUsers((prev) => prev.filter((u) => u !== id));
        fetchUsers();
      } catch (err: any) {
        toast.error(err.message || "Failed to delete user");
      }
    });
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      toast.error("No users selected");
      return;
    }
    if (!confirm(`Delete ${selectedUsers.length} users?`)) return;

    startTransition(async () => {
      try {
        await bulkDeleteUsers(selectedUsers);
        toast.success("Users deleted");
        setSelectedUsers([]);
        fetchUsers();
      } catch (err: any) {
        toast.error(err.message || "Bulk delete failed");
      }
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((u) => u.id));
    }
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setRoleFilter("all");
    setSort("newest");
    setPage(1);
  };

  const hasActiveFilters =
    searchQuery || roleFilter !== "all" || sort !== "newest";

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Users</h1>
        {selectedUsers.length > 0 && (
          <button
            onClick={handleBulkDelete}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete ({selectedUsers.length})
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border rounded-lg"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <XIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Role */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border rounded-lg min-w-[140px]"
          >
            {roleOptions.map((opt) => (
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
            className="px-4 py-2 border rounded-lg min-w-[160px]"
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
              className="px-4 py-2 bg-gray-100 rounded-lg flex items-center gap-1"
            >
              <XIcon className="w-4 h-4" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    selectedUsers.length === users.length && users.length > 0
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleSelect(user.id)}
                  />
                </td>
                <td className="px-4 py-3">{user.name || "—"} </td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/users/${user.id}/edit`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(user.id)}
                      disabled={isPending}
                      className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
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

        {users.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            No users found
          </div>
        )}

        {loading && users.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-gray-600">
              Page {page} of {totalPages} ({totalUsers} total users)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border rounded disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border rounded disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
