// src/app/admin/products/page.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Package,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X as XIcon,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  getAllProducts,
  deleteProduct,
  bulkDeleteProducts,
  getProductStats,
} from "@/actions/admin/productActions";
import { getAllCategoriesWithCounts } from "@/actions/admin/categoryActions";
import { getAllSubCategoriesWithCounts } from "@/actions/admin/subCategoryActions";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  brand?: string | null;
  categoryId?: string | null;
  subCategoryId?: string | null;
  isFeatured: boolean;
  thumbnail: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  rating?: number | null;
  totalReviews?: number | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  subCategory?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Category {
  id: string;
  name: string;
  productCount: number;
}

interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  productCount: number;
}

export default function AdminProductsPage() {
  const searchParams = useSearchParams();
  const categoryIdFilter = searchParams.get("categoryId");
  const subCategoryIdFilter = searchParams.get("subCategoryId");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState<SubCategory[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    inStock: 0,
    outOfStock: 0,
    featured: 0,
    lowStock: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryIdFilter || "all");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(subCategoryIdFilter || "all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "price-low" | "price-high" | "name">("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "name", label: "Name: A to Z" },
  ];

  // Fetch initial data on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Update filtered subcategories when category changes
  useEffect(() => {
    if (selectedCategoryId === "all") {
      setFilteredSubCategories(subCategories);
    } else {
      setFilteredSubCategories(
        subCategories.filter((sub) => sub.categoryId === selectedCategoryId)
      );
    }
    // Reset subcategory selection if it doesn't belong to selected category
    if (selectedSubCategoryId !== "all") {
      const subCat = subCategories.find((s) => s.id === selectedSubCategoryId);
      if (subCat && subCat.categoryId !== selectedCategoryId && selectedCategoryId !== "all") {
        setSelectedSubCategoryId("all");
      }
    }
  }, [selectedCategoryId, subCategories]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [page, searchQuery, selectedCategoryId, selectedSubCategoryId, sortBy]);

  const fetchInitialData = async () => {
    try {
      const [catsData, subCatsData] = await Promise.all([
        getAllCategoriesWithCounts(),
        getAllSubCategoriesWithCounts(),
      ]);
      setCategories(catsData.categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        productCount: cat.productCount,
      })));
      setSubCategories(subCatsData.subcategories);
    } catch (error: any) {
      console.error("Failed to fetch initial data:", error);
      toast.error(error.message || "Failed to load categories");
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [productsResult, statsResult] = await Promise.all([
        getAllProducts({
          page,
          limit: 10,
          search: searchQuery.trim() || undefined,
          categoryId: selectedCategoryId !== "all" ? selectedCategoryId : undefined,
          subCategoryId: selectedSubCategoryId !== "all" ? selectedSubCategoryId : undefined,
          sort: sortBy,
        }),
        getProductStats(),
      ]);

      if (productsResult.success && productsResult.products && productsResult.pagination) {
        setProducts(productsResult.products as Product[]);
        setTotalPages(productsResult.pagination.totalPages);
        setTotalProducts(productsResult.pagination.total);
      }

      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats);
      }
    } catch (error: any) {
      console.error("Failed to fetch products:", error);
      toast.error(error.message || "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    startTransition(async () => {
      try {
        const result = await deleteProduct(id);
        toast.success(result.message || "Product deleted successfully");
        setSelectedProducts((prev) => prev.filter((pid) => pid !== id));
        fetchProducts();
      } catch (error: any) {
        console.error("Delete error:", error);
        toast.error(error.message || "Failed to delete product");
      }
    });
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      toast.error("No products selected");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedProducts.length} products?`
      )
    )
      return;

    startTransition(async () => {
      try {
        const result = await bulkDeleteProducts(selectedProducts);
        toast.success(result.message || "Products deleted successfully");
        setSelectedProducts([]);
        fetchProducts();
      } catch (error: any) {
        console.error("Bulk delete error:", error);
        toast.error(error.message || "Failed to delete products");
      }
    });
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p.id));
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubCategoryId("all");
    setPage(1);
  };

  const handleSubCategoryChange = (subCategoryId: string) => {
    setSelectedSubCategoryId(subCategoryId);
    setPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort as typeof sortBy);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setSelectedCategoryId("all");
    setSelectedSubCategoryId("all");
    setSortBy("newest");
    setPage(1);
  };

  const getImageSrc = (thumbnail: string) => {
    return thumbnail?.startsWith("http")
      ? thumbnail
      : `/products/${thumbnail}`;
  };

  const hasActiveFilters =
    searchQuery || selectedCategoryId !== "all" || selectedSubCategoryId !== "all" || sortBy !== "newest";

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedSubCategory = subCategories.find((s) => s.id === selectedSubCategoryId);

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {(categoryIdFilter || subCategoryIdFilter) && (
            <Link
              href="/admin/products"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {selectedSubCategory
                ? `${selectedSubCategory.name} - Products`
                : selectedCategory
                ? `${selectedCategory.name} - Products`
                : "Products"}
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your product inventory ({stats.totalProducts} total)
            </p>
          </div>
        </div>
        <Link
          href="/admin/products/add"
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Total Products</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stats.totalProducts}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">In Stock</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {stats.inStock}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {stats.outOfStock}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Featured</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {stats.featured}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Low Stock</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {stats.lowStock}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name, description, or brand..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 min-w-[180px]"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.productCount})
              </option>
            ))}
          </select>

          {/* SubCategory Filter */}
          <select
            value={selectedSubCategoryId}
            onChange={(e) => handleSubCategoryChange(e.target.value)}
            disabled={selectedCategoryId === "all"}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 min-w-[180px] disabled:opacity-50"
          >
            <option value="all">All Subcategories</option>
            {filteredSubCategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} ({sub.productCount})
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 min-w-[180px]"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              <XIcon className="w-4 h-4" />
              Clear
            </button>
          )}

          {/* Bulk Actions */}
          {selectedProducts.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors whitespace-nowrap disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete ({selectedProducts.length})
            </button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
            {searchQuery && (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full flex items-center gap-1">
                Search: "{searchQuery}"
                <button
                  onClick={() => {
                    setSearchInput("");
                    setSearchQuery("");
                  }}
                  className="hover:bg-orange-200 rounded-full p-0.5"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCategoryId !== "all" && selectedCategory && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full flex items-center gap-1">
                Category: {selectedCategory.name}
                <button
                  onClick={() => setSelectedCategoryId("all")}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedSubCategoryId !== "all" && selectedSubCategory && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full flex items-center gap-1">
                Subcategory: {selectedSubCategory.name}
                <button
                  onClick={() => setSelectedSubCategoryId("all")}
                  className="hover:bg-purple-200 rounded-full p-0.5"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              </span>
            )}
            {sortBy !== "newest" && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full flex items-center gap-1">
                Sort:{" "}
                {sortOptions.find((opt) => opt.value === sortBy)?.label}
                <button
                  onClick={() => setSortBy("newest")}
                  className="hover:bg-green-200 rounded-full p-0.5"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
          <p className="text-gray-500 mt-2">Loading products...</p>
        </div>
      )}

      {/* Products Table */}
      {!loading && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedProducts.length === products.length &&
                        products.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleSelectProduct(product.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={getImageSrc(product.thumbnail)}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {product.brand || "No brand"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        {product.category && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded w-fit">
                            {product.category.name}
                          </span>
                        )}
                        {product.subCategory && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded w-fit">
                            {product.subCategory.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-gray-900">
                          NPR {product.price.toLocaleString()}
                        </span>
                        {product.originalPrice &&
                          product.originalPrice > product.price && (
                            <span className="text-xs text-gray-500 line-through">
                              NPR {product.originalPrice.toLocaleString()}
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "font-medium",
                          product.stock > 10
                            ? "text-green-600"
                            : product.stock > 0
                            ? "text-orange-600"
                            : "text-red-600"
                        )}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        {product.isFeatured && (
                          <span className="px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700 rounded w-fit">
                            Featured
                          </span>
                        )}
                        <span
                          className={cn(
                            "px-2 py-0.5 text-xs font-semibold rounded w-fit",
                            product.stock > 0
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          )}
                        >
                          {product.stock > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/products/${product.id}`}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/products/edit/${product.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={isPending}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {products.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No products found</p>
              <p className="text-gray-500 text-sm mt-1">
                {hasActiveFilters
                  ? "Try adjusting your filters or search query"
                  : "Get started by adding your first product"}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {page} of {totalPages} ({totalProducts} total products)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}