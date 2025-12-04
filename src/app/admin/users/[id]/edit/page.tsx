// src/app/admin/users/[id]/edit/page.tsx
"use client";

import { useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Save, X as XIcon } from "lucide-react";
import { getUserDetails, updateUser } from "@/actions/admin/userActions";
import { useEffect } from "react";

interface UserEditForm {
  name: string;
  email: string;
  role: string;
  password: string;
}

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [formData, setFormData] = useState<UserEditForm>({
    name: "",
    email: "",
    role: "user",
    password: "", // leave blank to skip update
  });
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserDetails(userId);
        if (!data) {
          toast.error("User not found");
          router.push("/admin/users");
          return;
        }
        setFormData({
          name: data.name || "",
          email: data.email,
          role: data.role,
          password: "", // never prefill password
        });
      } catch (err: any) {
        toast.error(err.message || "Failed to load user");
        router.push("/admin/users");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUser();
  }, [userId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    startTransition(async () => {
      try {
        await updateUser(userId, {
          name: formData.name || undefined, // send undefined if empty
          email: formData.email.trim(),
          role: formData.role,
        });

        // Optionally update password if provided
        if (formData.password.trim()) {
          // You'd need a separate action like `updateUserPassword`
          // For now, we skip password in this example (security best practice)
          toast.warning("Password update requires a dedicated secure flow.");
        }

        toast.success("User updated successfully");
        router.push(`/admin/users/${userId}`);
      } catch (err: any) {
        console.error("Update error:", err);
        toast.error(err.message || "Failed to update user");
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Edit User</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-200 flex items-center gap-2">
          <XIcon className="w-4 h-4" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 space-y-5">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="John Doe"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="user@example.com"
          />
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Password (optional) */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            New Password (optional)
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave blank to keep current password. For security, consider implementing a separate password reset flow.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}