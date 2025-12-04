// src/app/page.tsx
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Truck,
  Shield,
  RefreshCw,
  Star,
  ArrowRight,
  TrendingUp,
  Zap,
  Heart,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { getAllProducts } from "@/actions/api/productApi";

export default async function HomePage() {
  // Fetch products
  const allProducts = await getAllProducts();
  const featuredProducts = allProducts.filter((p) => p.isFeatured).slice(0, 8);
  const newArrivals = allProducts.slice(0, 4);
  // console.log("allProducts:", allProducts);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                <Zap className="w-4 h-4" />
                <span>New Season Sale - Up to 50% Off</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Discover Your
                <span className="block bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  Perfect Style
                </span>
              </h1>

              <p className="text-lg text-gray-600 max-w-lg mx-auto lg:mx-0">
                Shop the latest trends in fashion, electronics, and home decor. 
                Quality products at unbeatable prices with fast, free shipping.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Shop Now
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-50 transition-all border-2 border-gray-200"
                >
                  Explore Collections
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
                <div className="text-center lg:text-left">
                  <p className="text-3xl font-bold text-gray-900">10K+</p>
                  <p className="text-sm text-gray-600">Products</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-3xl font-bold text-gray-900">50K+</p>
                  <p className="text-sm text-gray-600">Customers</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-3xl font-bold text-gray-900">4.8★</p>
                  <p className="text-sm text-gray-600">Rating</p>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative  w-full bg-red h-[400px] lg:h-[500px]">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-200 to-pink-200 rounded-3xl transform rotate-6"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-pink-400 rounded-3xl transform rotate-3 opacity-50"></div>
                <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl overflow-hidden">
                  <Image
                    src="/hero-image.jpg"
                    alt="Shopping"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-4 -right-4 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <div>
                    <p className="font-bold text-gray-900">4.8/5</p>
                    <p className="text-xs text-gray-500">2.5k Reviews</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-bold text-gray-900">50% OFF</p>
                    <p className="text-xs text-gray-500">Limited Time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Truck,
                title: "Free Shipping",
                desc: "On orders over NPR 5,000",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: Shield,
                title: "Secure Payment",
                desc: "100% protected checkout",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: RefreshCw,
                title: "Easy Returns",
                desc: "30-day return policy",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: Star,
                title: "Quality Assured",
                desc: "Premium products only",
                color: "from-orange-500 to-red-500",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group text-center p-6 rounded-2xl hover:bg-gray-50 transition-all"
                >
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Featured Products
                </h2>
                <p className="text-gray-600">
                  Handpicked favorites just for you
                </p>
              </div>
              <Link
                href="/products"
                className="hidden sm:flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold"
              >
                View All
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-8 sm:hidden">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold"
              >
                View All Products
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-semibold mb-4">
                <Heart className="w-4 h-4" />
                Just Arrived
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                New Arrivals
              </h2>
              <p className="text-gray-600">
                Fresh picks, just for you
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Start Shopping?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of happy customers and discover amazing products at unbeatable prices
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl"
          >
            <ShoppingBag className="w-5 h-5" />
            Browse All Products
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-gray-600 mb-8">
            Get exclusive offers, new arrivals, and shopping tips delivered to your inbox
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}