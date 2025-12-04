// src/app/admin/layout.tsx
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ecommerce Admin Page",
  description: "Admin panel for ecommerce site",
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white shadow-md z-30 overflow-y-auto">
        <AdminSidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 ml-64">
        {/* Sticky Header */}
        <header className="sticky top-0 h-16 bg-white shadow-sm z-20 border-b border-gray-200">
          <AdminHeader />
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}