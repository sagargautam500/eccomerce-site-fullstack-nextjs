"use client";

import { Bell } from "lucide-react";

export default function AdminHeader() {
  return (
    <div className="h-full flex items-center justify-between px-6">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-sm">A</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">
          Admin <span className="text-orange-500">Panel</span>
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          aria-label="Notifications"
          className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:shadow-md transition-shadow">
          AD
        </div>
      </div>
    </div>
  );
}