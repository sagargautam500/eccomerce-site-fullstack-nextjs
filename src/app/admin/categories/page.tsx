// src/app/admin/categories/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Tag,
  Package,
  Save,
  X,
  Layers,
  Search as SearchIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  getAllCategoriesWithCounts,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/actions/admin/categoryActions";
import ImageUpload from "@/components/admin/ImageUpload";

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  productCount: number;
  subCategoryCount: number;
  createdAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({ name: "", image: "" });
  const [editCategory, setEditCategory] = useState({ name: "", image: "" });
  const [submitting, setSubmitting] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch categories when filters or page changes
  useEffect(() => {
    fetchCategories();
  }, [page, searchQuery]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const result = await getAllCategoriesWithCounts({
        page,
        limit: 10,
        search: searchQuery || undefined,
      });

      if (result.success) {
        setCategories(result.categories);
        setTotalPages(result.pagination.totalPages);
        setTotalCategories(result.pagination.total);
      }
    } catch (error: any) {
      console.error("Failed to fetch categories:", error);
      toast.error(error.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    try {
      setSubmitting(true);
      const res = await createCategory({
        name: newCategory.name.trim(),
        image: newCategory.image.trim() || undefined,
      });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success("Category added successfully");
      setShowAddModal(false);
      setNewCategory({ name: "", image: "" });
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || "Failed to add category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    if (!editCategory.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    try {
      setSubmitting(true);
      const res = await updateCategory(editingCategory.id, {
        name: editCategory.name.trim(),
        image: editCategory.image.trim() || undefined,
      });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success("Category updated successfully");
      setShowEditModal(false);
      setEditingCategory(null);
      setEditCategory({ name: "", image: "" });
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || "Failed to update category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (
    id: string,
    name: string,
    productCount: number,
    subCategoryCount: number
  ) => {
    if (productCount > 0 || subCategoryCount > 0) {
      const items = [];
      if (productCount > 0) items.push(`${productCount} products`);
      if (subCategoryCount > 0) items.push(`${subCategoryCount} subcategories`);
      toast.error(`Cannot delete category with ${items.join(" and ")}.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteCategory(id);
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete category");
    }
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setEditCategory({
      name: category.name,
      image: category.image || "",
    });
    setShowEditModal(true);
  };

  const getImageSrc = (image?: string | null) => {
    if (!image) return "";
    if (image.startsWith("/")) return image;
    return `/categories/${image}`;
  };

  const totalProducts = categories.reduce((sum, cat) => sum + cat.productCount, 0);
  const totalSubCategories = categories.reduce(
    (sum, cat) => sum + cat.subCategoryCount,
    0
  );

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Categories
              </h1>
              <p className="text-gray-500 mt-1">
                Manage product categories ({totalCategories} total)
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-pink-600 shadow-md whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        </div>

        {/* Stats */}
        {categories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600">Total Categories</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalCategories}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600">Total Subcategories</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {totalSubCategories}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {totalProducts}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600">This Page</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {categories.length} categories
              </p>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-lg border p-4">
          <div className="relative max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search categories by name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {category.image ? (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={getImageSrc(category.image)}
                        alt={category.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  ) : (
                    <div className="p-2 bg-gradient-to-r from-orange-100 to-pink-100 rounded-lg flex-shrink-0">
                      <Tag className="w-6 h-6 text-orange-600" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                      {category.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        {category.subCategoryCount}{" "}
                        {category.subCategoryCount === 1 ? "sub" : "subs"}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {category.productCount}{" "}
                        {category.productCount === 1 ? "product" : "products"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <Link
                  href={`/admin/subcategories?categoryId=${category.id}`}
                  className="flex-1 px-2 py-1.5 text-center text-xs font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100"
                >
                  Subcategories
                </Link>
                <Link
                  href={`/admin/products?categoryId=${category.id}`}
                  className="flex-1 px-2 py-1.5 text-center text-xs font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100"
                >
                  Products
                </Link>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(category)}
                  className="flex-1 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-1"
                >
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Edit</span>
                </button>
                <button
                  onClick={() =>
                    handleDeleteCategory(
                      category.id,
                      category.name,
                      category.productCount,
                      category.subCategoryCount
                    )
                  }
                  className={cn(
                    "flex-1 p-1.5 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-1",
                    category.productCount > 0 || category.subCategoryCount > 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-red-600 hover:bg-red-50"
                  )}
                  disabled={
                    category.productCount > 0 || category.subCategoryCount > 0
                  }
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {categories.length === 0 && !loading && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 sm:p-12 text-center">
            <Tag className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No categories found</p>
            <p className="text-gray-500 text-sm mt-1">
              {searchQuery
                ? "Try a different search term"
                : "Click 'Add Category' to get started"}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
            <p className="text-sm text-gray-600">
              Page {page} of {totalPages}
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

        {/* Add Category Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Add New Category</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewCategory({ name: "", image: "" });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                    placeholder="Enter category name"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    onKeyPress={(e) =>
                      e.key === "Enter" && !submitting && handleAddCategory()
                    }
                    autoFocus
                  />
                </div>

                {/* Image Upload */}
                <ImageUpload
                  value={newCategory.image}
                  onChange={(url) =>
                    setNewCategory({ ...newCategory, image: url })
                  }
                  label="Category Image"
                  helperText="Upload an image or enter URL for the category"
                />

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setNewCategory({ name: "", image: "" });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCategory}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-pink-600 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Category"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Category Modal */}
        {showEditModal && editingCategory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Edit Category</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCategory(null);
                    setEditCategory({ name: "", image: "" });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={editCategory.name}
                    onChange={(e) =>
                      setEditCategory({ ...editCategory, name: e.target.value })
                    }
                    placeholder="Enter category name"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    onKeyPress={(e) =>
                      e.key === "Enter" && !submitting && handleUpdateCategory()
                    }
                    autoFocus
                  />
                </div>

                {/* Image Upload */}
                <ImageUpload
                  value={editCategory.image}
                  onChange={(url) =>
                    setEditCategory({ ...editCategory, image: url })
                  }
                  label="Category Image"
                  helperText="Upload an image or enter URL for the category"
                />

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingCategory(null);
                      setEditCategory({ name: "", image: "" });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateCategory}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-pink-600 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Update
                      </>
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