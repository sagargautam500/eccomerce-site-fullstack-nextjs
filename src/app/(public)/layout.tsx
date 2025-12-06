import type { Metadata } from "next";
import "../globals.css";
import Footer from "@/components/footer";
import Navbar from "@/components/Navbar";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Ecommerce Project",
  description: "Ecommerce project with payment gateway integration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen overflow-x-hidden">
        <Navbar />

        <main className="flex-1 w-full">
          <SessionProvider>
            {children}
            <Toaster position="top-right" richColors />
          </SessionProvider>
        </main>

        <Footer />
      </body>
    </html>
  );
}
