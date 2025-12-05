// components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6 px-4 mt-12">
      <div className="max-w-6xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-transparent bg-clip-text">
                Chimteshwar Shop
              </span>
            </h3>
            <p className="text-sm leading-relaxed">
              Premium shopping experience for the Nepalese market. Quality products, trusted service.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-white transition">Home</Link></li>
              <li><Link href="/products" className="hover:text-white transition">Products</Link></li>
              <li><Link href="/cart" className="hover:text-white transition">Cart</Link></li>
              <li><Link href="/orders" className="hover:text-white transition">My Orders</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">Support</h4>
            <ul className="space-y-2">
              <li><Link href="/help" className="hover:text-white transition">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact Us</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition">Shipping Info</Link></li>
              <li><Link href="/returns" className="hover:text-white transition">Returns & Refunds</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">Contact</h4>
            <address className="not-italic text-sm space-y-2">
              <p>📍 New Road, Kathmandu, Nepal</p>
              <p>📱 +977 980-000-0000</p>
              <p>✉️ support@chimteshwarshop.com</p>
            </address>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-6 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Chimteshwar Shop.
          </p>
          <p className="text-xs text-gray-600 mt-1">
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}