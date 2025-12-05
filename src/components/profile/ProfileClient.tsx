// ============================================
// src/components/profile/ProfileClient.tsx
"use client";

import { useState } from "react";
import { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import {
  User as UserIcon,
  Mail,
  Calendar,
  ShoppingBag,
  Heart,
  ShoppingCart,
  Edit2,
  Save,
  X,
  Package,
  TrendingUp,
  Award,
  Clock,
} from "lucide-react";
import { User } from "@/types/user";
import { updateUserProfile } from "@/actions/api/userApi";
import { toast } from "sonner";

interface ProfileClientProps {
  user: User;
  stats: {
    totalOrders: number;
    totalSpent: number;
    wishlistCount: number;
    cartItemsCount: number;
  } | null;
  session: Session;
}

export default function ProfileClient({
  user,
  stats,
  session,
}: ProfileClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const result = await updateUserProfile(user.email, { name });
      if (result.success) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user.name || "");
    setIsEditing(false);
  };

  const formatDate = (date?: Date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 h-32 sm:h-40"></div>
          
          <div className="px-6 sm:px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-20 mb-6">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-8 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-orange-400 to-pink-400">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={user.name || "Profile"}
                        width={160}
                      height={160}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserIcon className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
                    </div>
                  )}
                </div>
                {user.role === "admin" && (
                  <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Admin
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="sm:ml-6 mt-4 sm:mt-0 text-center sm:text-left flex-1">
                {isEditing ? (
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="px-4 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg font-bold"
                      placeholder="Enter your name"
                    />
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                      {user.name || "Guest User"}
                    </h1>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Joined {formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <Link
                href="/orders"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-all border-2 border-transparent hover:border-blue-200"
              >
                <Package className="w-8 h-8 text-blue-600" />
                <span className="text-sm font-semibold text-gray-900">My Orders</span>
              </Link>

              <Link
                href="/wishlist"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-pink-50 to-red-50 hover:from-pink-100 hover:to-red-100 transition-all border-2 border-transparent hover:border-pink-200"
              >
                <Heart className="w-8 h-8 text-pink-600" />
                <span className="text-sm font-semibold text-gray-900">Wishlist</span>
              </Link>

              <Link
                href="/cart"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 transition-all border-2 border-transparent hover:border-orange-200"
              >
                <ShoppingCart className="w-8 h-8 text-orange-600" />
                <span className="text-sm font-semibold text-gray-900">Cart</span>
              </Link>

              <Link
                href="/products"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all border-2 border-transparent hover:border-purple-200"
              >
                <ShoppingBag className="w-8 h-8 text-purple-600" />
                <span className="text-sm font-semibold text-gray-900">Shop Now</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-transparent hover:border-blue-200 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase">Orders</span>
              </div>
              <p className="text-3xl font-black text-gray-900">{stats.totalOrders}</p>
              <p className="text-sm text-gray-600 mt-1">Total Orders</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-transparent hover:border-green-200 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase">Spent</span>
              </div>
              <p className="text-3xl font-black text-gray-900">
                NPR {stats.totalSpent.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Spending</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-transparent hover:border-pink-200 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-pink-100 p-3 rounded-xl">
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase">Wishlist</span>
              </div>
              <p className="text-3xl font-black text-gray-900">{stats.wishlistCount}</p>
              <p className="text-sm text-gray-600 mt-1">Saved Items</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-transparent hover:border-orange-200 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-100 p-3 rounded-xl">
                  <ShoppingCart className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase">Cart</span>
              </div>
              <p className="text-3xl font-black text-gray-900">{stats.cartItemsCount}</p>
              <p className="text-sm text-gray-600 mt-1">Items in Cart</p>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-orange-500" />
            Account Information
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600 uppercase">Email Address</label>
                <p className="text-lg text-gray-900 mt-1">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 uppercase">Account Type</label>
                <p className="text-lg text-gray-900 mt-1 capitalize">{user.role}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600 uppercase">Member Since</label>
                <p className="text-lg text-gray-900 mt-1">{formatDate(user.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 uppercase">Last Updated</label>
                <p className="text-lg text-gray-900 mt-1">{formatDate(user.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}