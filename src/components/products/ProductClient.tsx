// src/components/products/ProductsClient.tsx (Updated)
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Product } from "@/types/product";
import { Category, SubCategory } from "@/types/category";
import { Loader2 } from "lucide-react";
import ProductSidebar from "./ProductSidebar";
import ProductCard from "./ProductCard";

interface ProductsClientProps {
  categories: Category[];
  subCategories: SubCategory[];
  initialData: {
    products: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function ProductsClient({
  categories,
  subCategories,
  initialData,
  searchParams,
}: ProductsClientProps) {
  const router = useRouter();
  const urlParams = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>(initialData.products);
  const [loading, setLoading] = useState(false);
  const [totalProducts, setTotalProducts] = useState(initialData.total);
  
  // Pagination state
  const page = Number(searchParams.page) || 1;
  const limit = 12;
  const totalPages = Math.ceil(totalProducts / limit);

  // Filters state
  const [filters, setFilters] = useState({
    search: (searchParams.search as string) || "",
    categoryId: (searchParams.categoryId as string) || "",
    subCategoryId: (searchParams.subCategoryId as string) || "",
    minPrice: (searchParams.minPrice as string) || "",
    maxPrice: (searchParams.maxPrice as string) || "",
  });

  // Update products when initialData changes (on navigation)
  useEffect(() => {
    setProducts(initialData.products);
    setTotalProducts(initialData.total);
    setLoading(false);
  }, [initialData]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setLoading(true);
    
    // Update URL - this will trigger server-side refetch
    const queryParams = new URLSearchParams();
    if (newFilters.search) queryParams.set("search", newFilters.search);
    if (newFilters.categoryId) queryParams.set("categoryId", newFilters.categoryId);
    if (newFilters.subCategoryId) queryParams.set("subCategoryId", newFilters.subCategoryId);
    if (newFilters.minPrice) queryParams.set("minPrice", newFilters.minPrice);
    if (newFilters.maxPrice) queryParams.set("maxPrice", newFilters.maxPrice);
    queryParams.set("page", "1"); // Reset to page 1 on filter change
    
    router.push(`/products?${queryParams.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    setLoading(true);
    const queryParams = new URLSearchParams(urlParams.toString());
    queryParams.set("page", newPage.toString());
    router.push(`/products?${queryParams.toString()}`);
    
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Create lookup maps
  const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
  const subCategoryMap = new Map(subCategories.map(sub => [sub.id, sub]));

  return (
    <div className="min-h-screen mt-8 bg-gray-50 w-full overflow-x-hidden">
      <div className="max-w-8xl ml-10  mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 lg:mb-8">
          All Products
        </h1>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full">
          {/* Sidebar - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:block">
            <ProductSidebar
              categories={categories}
              subCategories={subCategories}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Mobile Sidebar - Only visible when opened */}
          <div className="lg:hidden">
            <ProductSidebar
              categories={categories}
              subCategories={subCategories}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Products Grid */}
          <main className="flex-1 w-full min-w-0">
            {/* Results Summary */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm sm:text-base text-gray-600">
                Showing <span className="font-semibold">{products.length}</span> of{" "}
                <span className="font-semibold">{totalProducts}</span> products
              </p>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500 text-lg mb-2">No products found</p>
                <p className="text-gray-400 text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      categoryName={categoryMap.get(product.categoryId)?.name}
                      subCategoryName={subCategoryMap.get(product.subCategoryId)?.name}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-2 mt-8">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1 || loading}
                      className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium"
                    >
                      Previous
                    </button>

                    <div className="flex gap-2 flex-wrap justify-center">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            disabled={loading}
                            className={`px-4 py-2 rounded-lg border font-medium transition-colors disabled:opacity-50 ${
                              pageNum === page
                                ? "bg-orange-500 text-white border-orange-500"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages || loading}
                      className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}