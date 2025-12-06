import "../globals.css";
import AdminNavbar from "@/components/admin/AdminNavbar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import AdminFooter from "@/components/admin/AdminFooter";

export const metadata = {
  title: "Admin Panel",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user?.role !== "admin") {
    redirect("/login");
  }

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-gray-50 overflow-x-hidden">
        <AdminNavbar />

        <main className="flex-1">
          <SessionProvider>
            {children}
            <Toaster position="top-right" richColors />
          </SessionProvider>
        </main>
        <AdminFooter />
      </body>
    </html>
  );
}
