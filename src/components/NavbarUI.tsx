// src/components/NavbarUI.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Session } from "next-auth";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  Package,
  HelpCircle,
  Menu,
  X,
  Home,
  Phone,
  Heart,
  User,
  LogOut,
  Shield,
  ChevronDown,
  UserCircle,
} from "lucide-react";
import { handleSignOut } from "@/actions/authAction";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

export default function NavbarUI({ session }: { session: Session | null }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();

  // Get cart and wishlist counts
const cartCount = useCartStore((state) => state.getCartItemsCount());
const wishlistCount = useWishlistStore((state) => state.getWishlistCount());

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setIsUserMenuOpen(false);
      }
    };
    
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isUserMenuOpen]);

  const isActive = (path: string) => pathname === path;

  // Navigation Links Configuration
  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/products", label: "Products", icon: Package },
    { 
      href: "/cart", 
      label: "Cart", 
      icon: ShoppingCart,
      badge: cartCount
    },
    { 
      href: "/wishlist", 
      label: "Wishlist", 
      icon: Heart,
      badge: wishlistCount
    },
  ];

  // Dropdown Menu Configuration
  const loggedInDropdownLinks = [
    { href: "/profile", label: "Profile", icon: UserCircle },
    { href: "/orders", label: "My Orders", icon: Package },
    { href: "/help", label: "Help", icon: HelpCircle },
    { href: "/contact", label: "Contact", icon: Phone },
  ];

  const guestDropdownLinks = [
    { href: "/auth/signin", label: "Sign In", icon: User },
    { href: "/auth/signup", label: "Sign Up", icon: UserCircle },
    { href: "/help", label: "Help", icon: HelpCircle },
    { href: "/contact", label: "Contact", icon: Phone },
  ];

  const dropdownLinks = session ? loggedInDropdownLinks : guestDropdownLinks;

  const handleSignOutClick = async () => {
    setIsUserMenuOpen(false);
    await handleSignOut();
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const closeUserMenu = () => {
    setIsUserMenuOpen(false);
  };

  // Render badge component
  const Badge = ({ count }: { count: number }) => {
    if (!count) return null;
    return (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-md">
        {count > 99 ? '99+' : count}
      </span>
    );
  };

  // Render dropdown menu item
  const renderDropdownItem = (link: typeof dropdownLinks[0], index: number) => {
    const Icon = link.icon;
    return (
      <Link
        key={index}
        href={link.href}
        onClick={closeUserMenu}
        className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 transition-colors text-gray-700 hover:text-orange-600"
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{link.label}</span>
      </Link>
    );
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? "bg-white shadow-xl border-b border-gray-100"
          : "bg-white/95 backdrop-blur-xl shadow-lg"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 py-4 group flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 rounded-xl blur-sm group-hover:blur-md transition-all"></div>
              <div className="relative bg-gradient-to-r from-orange-500 to-pink-500 p-2 sm:p-2.5 rounded-xl shadow-md group-hover:shadow-lg transition-all">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Chimteshwar Shop
              </span>
              <p className="text-xs text-gray-500 hidden lg:block">Premium Shopping Experience</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link, index) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={index}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg font-medium transition-all ${
                    active
                      ? "text-orange-600"
                      : "text-gray-600 hover:text-orange-600 hover:bg-orange-50/50"
                  }`}
                >
                  {active && (
                    <span className="absolute inset-0 bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg border border-orange-100"></span>
                  )}
                  <div className="relative z-10">
                    <Icon className={`w-5 h-5 ${active ? "text-orange-600" : ""}`} />
                    <Badge count={link.badge || 0} />
                  </div>
                  <span className="relative z-10 hidden lg:inline">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 flex-shrink-0">
            {session && session.user?.role === "admin" && (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg bg-yellow-400 text-yellow-900 font-medium hover:bg-yellow-500 transition-all shadow-sm hover:shadow-md text-sm lg:text-base"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden lg:inline">Admin</span>
              </Link>
            )}

            {/* User/Account Dropdown */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  session
                    ? "bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-100 hover:border-orange-200"
                    : "border-2 border-orange-500 text-orange-600 font-medium hover:bg-orange-50"
                }`}
              >
                {session ? (
                  <>
                    <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-1.5 rounded-full">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-[80px] lg:max-w-[100px] truncate hidden lg:inline">
                      {session.user?.name || session.user?.email}
                    </span>
                  </>
                ) : (
                  <>
                    <User className="w-5 h-5" />
                    <span className="hidden lg:inline">Account</span>
                  </>
                )}
                <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  {dropdownLinks.map((link, index) => renderDropdownItem(link, index))}
                  
                  {session && (
                    <>
                      <div className="border-t border-gray-100 my-2"></div>
                      <button
                        onClick={handleSignOutClick}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-red-600 hover:text-red-700 w-full text-left"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-all flex-shrink-0"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-2xl">
          <div className="px-4 py-4 space-y-2 max-h-[calc(100vh-4.5rem)] overflow-y-auto">
            {/* User Info - Mobile */}
            {session && (
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl mb-3 border border-orange-100">
                <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-2 rounded-full">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {session.user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {session.user?.email}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            {navLinks.map((link, index) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={index}
                  href={link.href}
                  onClick={closeMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    active
                      ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 border border-transparent hover:border-orange-100"
                  }`}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {link.badge && link.badge > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">
                        {link.badge > 99 ? '99+' : link.badge}
                      </span>
                    )}
                  </div>
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* Account Section - Mobile */}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              {session ? (
                <>
                  {dropdownLinks.map((link, index) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={index}
                        href={link.href}
                        onClick={closeMenu}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 rounded-xl transition-all"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{link.label}</span>
                      </Link>
                    );
                  })}
                  
                  {session.user?.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={closeMenu}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-yellow-400 text-yellow-900 font-medium hover:bg-yellow-500 transition-all shadow-sm"
                    >
                      <Shield className="w-5 h-5" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  
                  <button
                    onClick={handleSignOutClick}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-red-500 text-white rounded-xl font-medium shadow-md hover:bg-red-600 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    onClick={closeMenu}
                    className="block px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl text-center font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={closeMenu}
                    className="block px-4 py-3 border-2 border-orange-500 text-orange-600 rounded-xl text-center font-medium hover:bg-orange-50 transition-all"
                  >
                    Sign Up
                  </Link>
                  {guestDropdownLinks.slice(2).map((link, index) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={index}
                        href={link.href}
                        onClick={closeMenu}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 rounded-xl transition-all"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{link.label}</span>
                      </Link>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}