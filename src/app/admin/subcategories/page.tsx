// src/app/admin/subcategories/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation"; // ✅ Required
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Layers,
  Package,
  Save,
  X,
  Tag,
  Search as SearchIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  getAllSubCategoriesWithCounts,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "@/actions/admin/subCategoryActions";
import { getAllCategoriesWithCounts } from "@/actions/admin/categoryActions";

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  productCount: number;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

export default function SubCategoriesPage() {
  const searchParams = useSearchParams(); // ✅ Get URL search params

  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>(""); // ✅ Will be set from URL
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubCategories, setTotalSubCategories] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<string | null>(null);
  const [newSubCategory, setNewSubCategory] = useState({ name: "", categoryId: "" });
  const [editSubCategory, setEditSubCategory] = useState({ name: "", categoryId: "" });
  const [submitting, setSubmitting] = useState(false);

  // ✅ Load categories once
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getAllCategoriesWithCounts();
        setCategories(data.categories.map((cat) => ({ id: cat.id, name: cat.name })));
      } catch (err: any) {
        toast.error(err.message || "Failed to load categories");
      }
    };
    loadCategories();
  }, []);

  // ✅ SET INITIAL FILTER FROM URL
  useEffect(() => {
    const categoryIdFromUrl = searchParams.get("categoryId");
    if (categoryIdFromUrl) {
      setCategoryFilter(categoryIdFromUrl);
    }
  }, [searchParams]); // Run when URL changes

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch when filters/page change
  useEffect(() => {
    fetchSubCategories();
  }, [page, searchQuery, categoryFilter]);

  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      const result = await getAllSubCategoriesWithCounts({
        page,
        limit: 9,
        search: searchQuery || undefined,
        categoryId: categoryFilter || undefined,
      });

      if (result.success) {
        setSubCategories(result.subcategories);
        setTotalPages(result.pagination.totalPages);
        setTotalSubCategories(result.pagination.total);
      }
    } catch (error: any) {
      console.error("Fetch subcategories error:", error);
      toast.error(error.message || "Failed to load subcategories");
      setSubCategories([]);
    } finally {
      setLoading(false);
    }
  };

 const handleAddSubCategory = async () => {
  if (!newSubCategory.name.trim()) {
    toast.error("Subcategory name is required");
    return;
  }

  if (!newSubCategory.categoryId) {
    toast.error("Please select a category");
    return;
  }

  try {
    setSubmitting(true);

    const res = await createSubCategory({
      name: newSubCategory.name.trim(),
      categoryId: newSubCategory.categoryId,
    });

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    toast.success("Subcategory added successfully");
    setShowAddModal(false);
    setNewSubCategory({ name: "", categoryId: "" });
    fetchSubCategories();
  } catch (error) {
    toast.error("Something went wrong");
  } finally {
    setSubmitting(false);
  }
};


  const handleUpdateSubCategory = async (id: string) => {
    if (!editSubCategory.name.trim()) {
      toast.error("Subcategory name is required");
      return;
    }
    if (!editSubCategory.categoryId) {
      toast.error("Please select a category");
      return;
    }
    try {
      setSubmitting(true);
      await updateSubCategory(id, {
        name: editSubCategory.name.trim(),
        categoryId: editSubCategory.categoryId,
      });
      toast.success("Subcategory updated successfully");
      setEditingSubCategory(null);
      setEditSubCategory({ name: "", categoryId: "" });
      fetchSubCategories();
    } catch (error: any) {
      toast.error(error.message || "Failed to update subcategory");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubCategory = async (
    id: string,
    name: string,
    productCount: number
  ) => {
    if (productCount > 0) {
      toast.error(
        `Cannot delete subcategory with ${productCount} products. Please delete or reassign products first.`
      );
      return;
    }

    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await deleteSubCategory(id);
      toast.success("Subcategory deleted successfully");
      fetchSubCategories();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete subcategory");
    }
  };

  const totalProducts = subCategories.reduce(
    (sum, sub) => sum + sub.productCount,
    0
  );

  const selectedCategoryName = categories.find(cat => cat.id === categoryFilter)?.name;

  if (loading && subCategories.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full"> {/* ✅ Added padding + responsive container */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Subcategories</h1>
              <p className="text-gray-500 mt-1">
                Manage product subcategories ({totalSubCategories} total)
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 shadow-md whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Add Subcategory
          </button>
        </div>

      

        {/* Stats */}
        {subCategories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600">Total Subcategories</p>
              <p className="text-2xl font-bold text-gray-900">{totalSubCategories}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-purple-600">{totalProducts}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600">This Page</p>
              <p className="text-2xl font-bold text-blue-600">{subCategories.length}</p>
            </div>
          </div>
        )}

            {/* Filters */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search subcategories by name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg min-w-[180px] focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ✅ Active Filter - Show Category NAME (not ID) */}
        {categoryFilter && selectedCategoryName && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Tag className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700">
              Showing subcategories under:{" "}
              <span className="font-semibold">{selectedCategoryName}</span>
            </span>
            <button
              onClick={() => {
                setCategoryFilter("");
                setPage(1);
              }}
              className="text-xs text-blue-600 hover:underline ml-2"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* SubCategories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subCategories.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              {editingSubCategory === sub.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editSubCategory.name}
                    onChange={(e) =>
                      setEditSubCategory({ ...editSubCategory, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Subcategory name"
                    autoFocus
                  />
                  <select
                    value={editSubCategory.categoryId}
                    onChange={(e) =>
                      setEditSubCategory({
                        ...editSubCategory,
                        categoryId: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateSubCategory(sub.id)}
                      disabled={submitting}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingSubCategory(null);
                        setEditSubCategory({ name: "", categoryId: "" });
                      }}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                        <Layers className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base">{sub.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{sub.categoryName}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Package className="w-3 h-3" />
                          {sub.productCount}{" "}
                          {sub.productCount === 1 ? "product" : "products"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/admin/products?subCategoryId=${sub.id}`}
                      className="flex-1 px-2 py-1.5 text-center text-xs font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100"
                    >
                      View Products
                    </Link>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        setEditingSubCategory(sub.id);
                        setEditSubCategory({
                          name: sub.name,
                          categoryId: sub.categoryId,
                        });
                      }}
                      className="flex-1 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">Edit</span>
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteSubCategory(sub.id, sub.name, sub.productCount)
                      }
                      className={cn(
                        "flex-1 p-1.5 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-1",
                        sub.productCount > 0
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-red-600 hover:bg-red-50"
                      )}
                      disabled={sub.productCount > 0}
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {subCategories.length === 0 && !loading && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 sm:p-12 text-center">
            <Layers className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No subcategories found</p>
            <p className="text-gray-500 text-sm mt-1">
              {searchQuery || categoryFilter
                ? "Try adjusting your filters"
                : "Add a new subcategory to get started."}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
            <p className="text-sm text-gray-600">
              Page {page} of {totalPages} ({totalSubCategories} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border rounded disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border rounded disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Add SubCategory Modal - unchanged */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Add New Subcategory</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewSubCategory({ name: "", categoryId: "" });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subcategory Name *
                  </label>
                  <input
                    type="text"
                    value={newSubCategory.name}
                    onChange={(e) =>
                      setNewSubCategory({ ...newSubCategory, name: e.target.value })
                    }
                    placeholder="e.g. Men's T-Shirts"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !submitting) handleAddSubCategory();
                    }}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={newSubCategory.categoryId}
                    onChange={(e) =>
                      setNewSubCategory({
                        ...newSubCategory,
                        categoryId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setNewSubCategory({ name: "", categoryId: "" });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSubCategory}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Subcategory"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}