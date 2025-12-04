// src/components/products/ProductSidebar.tsx
"use client";

import { useState, useEffect } from "react";
import { Category, SubCategory } from "@/types/category";
import { Search, X, Filter } from "lucide-react";

interface ProductSidebarProps {
  categories: Category[];
  subCategories: SubCategory[];
  filters: {
    search: string;
    categoryId: string;
    subCategoryId: string;
    minPrice: string;
    maxPrice: string;
  };
  onFilterChange: (filters: any) => void;
}

export default function ProductSidebar({
  categories,
  subCategories,
  filters,
  onFilterChange,
}: ProductSidebarProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [filteredSubCategories, setFilteredSubCategories] = useState<SubCategory[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Update filtered subcategories when category changes
  useEffect(() => {
    if (localFilters.categoryId) {
      setFilteredSubCategories(
        subCategories.filter(sub => sub.categoryId === localFilters.categoryId)
      );
    } else {
      setFilteredSubCategories(subCategories);
    }
  }, [localFilters.categoryId, subCategories]);

  // Debounce search input - apply after 500ms of no typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localFilters.search !== filters.search) {
        onFilterChange(localFilters);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [localFilters.search]);

  // Auto-apply filters immediately for non-search fields
  useEffect(() => {
    const nonSearchChanged = 
      localFilters.categoryId !== filters.categoryId ||
      localFilters.subCategoryId !== filters.subCategoryId ||
      localFilters.minPrice !== filters.minPrice ||
      localFilters.maxPrice !== filters.maxPrice;

    if (nonSearchChanged) {
      onFilterChange(localFilters);
    }
  }, [
    localFilters.categoryId,
    localFilters.subCategoryId,
    localFilters.minPrice,
    localFilters.maxPrice,
  ]);

  const handleChange = (field: string, value: string) => {
    const newFilters = { ...localFilters, [field]: value };
    
    // Reset subcategory if category changes
    if (field === "categoryId") {
      newFilters.subCategoryId = "";
    }
    
    setLocalFilters(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: "",
      categoryId: "",
      subCategoryId: "",
      minPrice: "",
      maxPrice: "",
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const hasActiveFilters = 
    localFilters.search ||
    localFilters.categoryId ||
    localFilters.subCategoryId ||
    localFilters.minPrice ||
    localFilters.maxPrice;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition-all hover:scale-110"
        aria-label="Toggle filters"
      >
        <Filter className="w-6 h-6" />
        {hasActiveFilters && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
            !
          </span>
        )}
      </button>

      {/* Sidebar - Only takes space on desktop */}
      <aside
        className={`
          w-full lg:w-72 lg:flex-shrink-0
          fixed lg:sticky 
          top-0 left-0 
          h-full lg:h-auto
          max-h-screen
          bg-white 
          shadow-2xl lg:shadow-sm 
          rounded-none lg:rounded-lg
          z-40 lg:z-auto
          overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              {hasActiveFilters && (
                <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full font-medium">
                  Active
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                disabled={!hasActiveFilters}
                className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Clear</span>
              </button>
              {/* Mobile close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close filters"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={localFilters.search}
                  onChange={(e) => handleChange("search", e.target.value)}
                  placeholder="Search by name..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
                Auto-search after 0.5s
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={localFilters.categoryId}
                onChange={(e) => handleChange("categoryId", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.25rem',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory
              </label>
              <select
                value={localFilters.subCategoryId}
                onChange={(e) => handleChange("subCategoryId", e.target.value)}
                disabled={!localFilters.categoryId}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all appearance-none bg-white cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.25rem',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="">All Subcategories</option>
                {filteredSubCategories.map((subCategory) => (
                  <option key={subCategory.id} value={subCategory.id}>
                    {subCategory.name}
                  </option>
                ))}
              </select>
              {!localFilters.categoryId && (
                <p className="text-xs text-gray-500 mt-1.5">
                  Select a category first
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range (NPR)
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={localFilters.minPrice}
                      onChange={(e) => handleChange("minPrice", e.target.value)}
                      placeholder="Min"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <span className="text-gray-400 font-medium">—</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={localFilters.maxPrice}
                      onChange={(e) => handleChange("maxPrice", e.target.value)}
                      placeholder="Max"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                {(localFilters.minPrice || localFilters.maxPrice) && (
                  <p className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                    {localFilters.minPrice && localFilters.maxPrice
                      ? `NPR ${localFilters.minPrice} - ${localFilters.maxPrice}`
                      : localFilters.minPrice
                      ? `From NPR ${localFilters.minPrice}`
                      : `Up to NPR ${localFilters.maxPrice}`}
                  </p>
                )}
              </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-2">
                  Active Filters:
                </p>
                <div className="flex flex-wrap gap-2">
                  {localFilters.search && (
                    <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded-full">
                      Search: {localFilters.search}
                    </span>
                  )}
                  {localFilters.categoryId && (
                    <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded-full">
                      {categories.find(c => c.id === localFilters.categoryId)?.name}
                    </span>
                  )}
                  {localFilters.subCategoryId && (
                    <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded-full">
                      {subCategories.find(s => s.id === localFilters.subCategoryId)?.name}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Apply Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              View Results
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}