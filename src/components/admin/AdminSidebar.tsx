"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  Home,
  BarChart3,
  Tag,
  Contact,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  subItems?: { label: string; href: string }[];
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const navItems: NavItem[] = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    {
      label: "Products",
      href: "/admin/products",
      icon: Package,
      subItems: [
        { label: "All Products", href: "/admin/products" },
        { label: "Add Product", href: "/admin/products/add" },
      ],
    },
    { label: "Categories", href: "/admin/categories", icon: Tag },
    { label: "Sub Categories", href: "/admin/subcategories", icon: Tag },
    { label: "Orders", href: "/admin/orders", icon: ShoppingCart, badge: 5 },
    { label: "Contact", href: "/admin/contact", icon: Contact },
  ];

  const isActive = (href: string) =>
    href === "/admin" ? pathname === href : pathname.startsWith(href);

  const toggleExpanded = (label: string) =>
    setExpandedItem(expandedItem === label ? null : label);

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 mt-18"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "hidden mt-15 lg:flex lg:flex-col lg:w-64 lg:sticky lg:top-0 lg:h-screen lg:bg-gray-900 lg:text-white lg:shadow-md z-40 transform transition-transform duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Panel</h1>
              <p className="text-xs text-gray-400">Management Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isItemActive = isActive(item.href);
            const hasSubItems = !!item.subItems?.length;
            const isExpanded = expandedItem === item.label;

            return (
              <div key={item.label}>
                {/* Main Item */}
                {hasSubItems ? (
                  <button
                    onClick={() => toggleExpanded(item.label)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200",
                      isItemActive
                        ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg"
                        : "text-gray-300 hover:bg-gray-700/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-red-500 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </div>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200",
                      isItemActive
                        ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg"
                        : "text-gray-300 hover:bg-gray-700/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-red-500 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )}

                {/* Sub Items */}
                {hasSubItems && isExpanded && (
                  <div className="mt-1 ml-4 space-y-1 border-l-2 border-gray-700 pl-4">
                    {item.subItems!.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={cn(
                          "block px-4 py-2 rounded-lg text-sm transition-colors",
                          pathname === subItem.href
                            ? "bg-gray-700 text-white font-medium"
                            : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                        )}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom: Back to Store */}
        <div className="p-4 border-t border-gray-700">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 hover:text-white transition-all"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Back to Store</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
