import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ecommerce Admin Panel",
  description: "Admin dashboard for Chimteshwar Shop",
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64">
        <div className="sticky top-0 h-screen">
          <AdminSidebar />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 w-full h-16 bg-white shadow-sm border-b border-gray-200">
          <AdminHeader />
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6">{children}</main>

       
      </div>
    </div>
  );
}
