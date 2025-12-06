// src/components/Footer.tsx
import Link from "next/link";
import { Mail, MapPin, Phone, Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto w-full">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-transparent bg-clip-text">
                Chimteshwar Shop
              </span>
            </h3>
            <p className="text-sm leading-relaxed text-gray-400">
              Premium shopping experience for the Nepalese market. Quality products, trusted service.
            </p>
            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-500 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-pink-500 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-blue-500 flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-base sm:text-lg">Quick Links</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link href="/" className="text-sm hover:text-orange-500 transition-colors inline-block">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-sm hover:text-orange-500 transition-colors inline-block">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-sm hover:text-orange-500 transition-colors inline-block">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-sm hover:text-orange-500 transition-colors inline-block">
                  My Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-base sm:text-lg">Customer Support</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link href="/help" className="text-sm hover:text-orange-500 transition-colors inline-block">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:text-orange-500 transition-colors inline-block">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-sm hover:text-orange-500 transition-colors inline-block">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-sm hover:text-orange-500 transition-colors inline-block">
                  Returns & Refunds
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-base sm:text-lg">Contact Us</h4>
            <address className="not-italic text-sm space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">New Road, Kathmandu, Nepal</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <a href="tel:+9779800000000" className="text-gray-400 hover:text-orange-500 transition-colors">
                  +977 980-000-0000
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <a href="mailto:support@chimteshwarshop.com" className="text-gray-400 hover:text-orange-500 transition-colors break-all">
                  support@chimteshwarshop.com
                </a>
              </div>
            </address>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p className="text-center sm:text-left">
              &copy; {currentYear} Chimteshwar Shop. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <Link href="/privacy" className="hover:text-orange-500 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-orange-500 transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-orange-500 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}