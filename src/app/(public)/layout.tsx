import type { Metadata } from "next";
import "../globals.css";
import Footer from "@/components/footer";
import Navbar from "@/components/Navbar";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";


export const metadata: Metadata = {
  title: {
    default: "Chimteshwor Shop | Online Shopping in Nepal",
    template: "%s | Chimteshwor Shop",
  },
  description:
    "Chimteshwor Shop is an online shopping platform in Nepal offering quality products at affordable prices.",
  keywords: [
    "Chimteshwor Shop",
    "Online Shopping Nepal",
    "Ecommerce Nepal",
    "Buy products online Nepal",
    "Nepal online store",
  ],
  authors: [{ name: "Chimteshwor Shop" }],
  creator: "Chimteshwor Shop",
  publisher: "Chimteshwor Shop",

  metadataBase: new URL("https://www.chimteshworenterprises.com.np/"), // change to your real domain

  openGraph: {
    title: "Chimteshwor Shop | Online Shopping in Nepal",
    description:
      "Shop quality products online in Nepal at Chimteshwor Shop.",
    url: "https://www.chimteshworenterprises.com.np/",
    siteName: "Chimteshwor Shop",
    images: [
      {
        url: "/og-image.png", // put image in /public
        width: 1200,
        height: 630,
        alt: "Chimteshwor Shop",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Chimteshwor Shop | Online Shopping in Nepal",
    description:
      "Best online shopping destination in Nepal.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
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
