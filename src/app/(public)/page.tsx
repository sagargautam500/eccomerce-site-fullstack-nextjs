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
  Award,
  Package,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import { getAllProducts, getFeaturedProducts } from "@/actions/api/productApi";
import { getAllCategories } from "@/actions/api/categoryApi";

export default async function HomePage() {
  // Fetch data
  const [allProductsData, featuredProducts, categories] = await Promise.all([
    getAllProducts({ limit: 8 }),
    getFeaturedProducts(8),
    getAllCategories(),
  ]);

  const newArrivals = allProductsData.products.slice(0, 4);
 

  return (
    <div className="min-h-screen mt-4 overflow-x-hidden">
      {/* Hero Section - Enhanced */}
      <section className="relative bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 sm:space-y-8 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-orange-200 text-orange-700 rounded-full text-sm font-semibold shadow-lg">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>Special Offer - Up to 50% Off</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 leading-tight">
                Shop Smarter,
                <span className="block bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
                  Live Better
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Discover premium products at unbeatable prices. From fashion to
                electronics, find everything you need with fast shipping and
                secure checkout.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/products"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white font-bold rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <ShoppingBag className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Start Shopping
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl hover:bg-gray-50 transition-all border-2 border-gray-200 hover:border-orange-300 shadow-lg"
                >
                  Browse Collections
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>

              {/* Stats - Enhanced */}
              <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-8">
                {[
                  { value: "10K+", label: "Products", icon: Package },
                  { value: "50K+", label: "Happy Customers", icon: Heart },
                  { value: "4.9★", label: "Rating", icon: Star },
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={idx}
                      className="text-center lg:text-left group cursor-pointer"
                    >
                      <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                        <Icon className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                        <p className="text-2xl sm:text-3xl font-black text-gray-900">
                          {stat.value}
                        </p>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">
                        {stat.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Image - Enhanced */}
            <div className="relative lg:mt-0">
              <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px]">
                {/* Decorative Blobs */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-pink-400 rounded-[3rem] transform rotate-6 opacity-20 blur-2xl"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-purple-400 rounded-[3rem] transform -rotate-6 opacity-20 blur-2xl"></div>

                {/* Main Image Container */}
                <div className="relative w-full h-full bg-gradient-to-br from-orange-100 to-pink-100 rounded-[3rem] shadow-2xl overflow-hidden border-4 border-white">
                  <Image
                    src="/hero-image.jpg"
                    alt="Shopping Experience"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    fill
                    className="object-cover"
                    priority
                  />

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>

                {/* Floating Info Cards */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-orange-100 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-xl">
                      <Star className="w-6 h-6 text-white fill-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">4.9/5</p>
                      <p className="text-xs text-gray-600">5k+ Reviews</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-green-100 animate-float animation-delay-2000">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-2 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">50% OFF</p>
                      <p className="text-xs text-gray-600">Limited Offer</p>
                    </div>
                  </div>
                </div>

                <div className="absolute top-1/2 -left-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-purple-100 animate-float animation-delay-4000">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-500" />
                    <p className="text-sm font-bold text-gray-900">
                      Fast Delivery
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced */}
      <section className="py-12 sm:py-16 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[
              {
                icon: Truck,
                title: "Free Shipping",
                desc: "Orders over NPR 5,000",
                color: "from-green-500 to-emerald-500",
                bgColor: "bg-green-50",
              },
              {
                icon: Shield,
                title: "Secure Payment",
                desc: "100% protected",
                color: "from-blue-500 to-cyan-500",
                bgColor: "bg-blue-50",
              },
              {
                icon: RefreshCw,
                title: "Easy Returns",
                desc: "30-day policy",
                color: "from-purple-500 to-pink-500",
                bgColor: "bg-purple-50",
              },
              {
                icon: Award,
                title: "Quality Assured",
                desc: "Premium only",
                color: "from-orange-500 to-red-500",
                bgColor: "bg-orange-50",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className={`group relative text-center p-4 sm:p-6 rounded-2xl ${feature.bgColor} hover:shadow-xl transition-all duration-300 cursor-pointer`}
                >
                  <div
                    className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}
                  >
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section - New */}
      {categories.length > 0 && (
        <section className="py-12 sm:py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3">
                Shop by Category
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Find exactly what you're looking for
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  href={`/products?categoryId=${category.id}`}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="aspect-square relative">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-200 to-pink-200">
                        <Package className="w-12 h-12 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-bold text-sm sm:text-base lg:text-lg">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products - Enhanced */}
      {featuredProducts.length > 0 && (
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 sm:mb-12 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-bold mb-3">
                  <Star className="w-4 h-4 fill-orange-600" />
                  Featured
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-2">
                  Trending Products
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  Handpicked favorites just for you
                </p>
              </div>
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-bold text-sm sm:text-base"
              >
                View All
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals - Enhanced */}
      {newArrivals.length > 0 && (
        <section className="py-12 sm:py-16 bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-pink-200 text-pink-700 rounded-full text-sm font-bold mb-4 shadow-lg">
                <Heart className="w-4 h-4 fill-pink-600 animate-pulse" />
                Just Dropped
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3">
                New Arrivals
              </h2>
              <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
                Fresh picks, trending styles, exclusive deals
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Enhanced */}
      <section className="relative py-16 sm:py-20 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-white rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-300 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full text-sm font-bold mb-6">
            <Zap className="w-4 h-4 animate-pulse" />
            Limited Time Offer
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 sm:mb-6">
            Ready to Start Shopping?
          </h2>
          <p className="text-base sm:text-lg text-white/95 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
            Join 50,000+ happy customers and discover amazing products at
            unbeatable prices
          </p>

          <Link
            href="/products"
            className="group inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-white text-orange-600 font-black rounded-2xl hover:bg-gray-50 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 text-base sm:text-lg"
          >
            <ShoppingBag className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            Browse All Products
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Newsletter - Enhanced */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-gray-50 to-orange-50 rounded-3xl p-8 sm:p-12 border-2 border-orange-100">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-bold mb-4">
              <Sparkles className="w-4 h-4" />
              Newsletter
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">
              Get Exclusive Offers
            </h2>
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
              Subscribe for deals, new arrivals, and insider tips
            </p>
            <form  method="post" className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:border-orange-500 focus:outline-none text-sm sm:text-base"
              />
              <button
                type="submit"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl sm:rounded-2xl hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
