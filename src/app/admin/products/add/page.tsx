// src/app/admin/products/add/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { createProduct } from "@/actions/admin/productActions";
import { getAllCategoriesWithCounts } from "@/actions/admin/categoryActions";
import { getAllSubCategoriesFull } from "@/actions/admin/subCategoryActions";

interface Category {
  id: string;
  name: string;
}

interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState<
    SubCategory[]
  >([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    brand: "",
    categoryId: "",
    subCategoryId: "",
    isFeatured: false,
    thumbnail: "",
    images: [""],
    sizes: [""],
    colors: [""],
    stock: "",
    rating: "",
    totalReviews: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (formData.categoryId) {
      setFilteredSubCategories(
        subCategories.filter((sub) => sub.categoryId === formData.categoryId)
      );
    } else {
      setFilteredSubCategories([]);
    }
    // Reset subcategory if category changes
    if (formData.subCategoryId) {
      const subCat = subCategories.find((s) => s.id === formData.subCategoryId);
      if (subCat && subCat.categoryId !== formData.categoryId) {
        setFormData((prev) => ({ ...prev, subCategoryId: "" }));
      }
    }
  }, [formData.categoryId, subCategories, formData.subCategoryId]);

  const fetchCategories = async () => {
    try {
      const [catsData, subCatsData] = await Promise.all([
        getAllCategoriesWithCounts({ limit: 100 }),
        getAllSubCategoriesFull(),
      ]);
      setCategories(
        catsData.categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
        }))
      );
      setSubCategories(
        subCatsData.subcategories.map((sub) => ({
          id: sub.id,
          name: sub.name,
          categoryId: sub.categoryId,
        }))
      );
    } catch (error: any) {
      console.error("Failed to fetch categories:", error);
      toast.error(error.message || "Failed to load categories");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleArrayChange = (
    index: number,
    value: string,
    field: "images" | "sizes" | "colors"
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayItem = (field: "images" | "sizes" | "colors") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayItem = (
    index: number,
    field: "images" | "sizes" | "colors"
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name ||
      !formData.description ||
      !formData.price ||
      !formData.categoryId ||
      !formData.subCategoryId ||
      !formData.thumbnail ||
      !formData.stock
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const data = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseInt(formData.price),
        originalPrice: formData.originalPrice
          ? parseInt(formData.originalPrice)
          : undefined,
        brand: formData.brand.trim() || undefined,
        categoryId: formData.categoryId,
        subCategoryId: formData.subCategoryId,
        isFeatured: formData.isFeatured,
        thumbnail: formData.thumbnail.trim(),
        images: formData.images.filter((img) => img.trim() !== ""),
        sizes: formData.sizes.filter((size) => size.trim() !== ""),
        colors: formData.colors.filter((color) => color.trim() !== ""),
        stock: parseInt(formData.stock),
        rating: formData.rating ? parseFloat(formData.rating) : undefined,
        totalReviews: formData.totalReviews
          ? parseInt(formData.totalReviews)
          : undefined,
      };

      const result = await createProduct(data);
      toast.success(result.message || "Product created successfully!");
      router.push("/admin/products");
    } catch (error: any) {
      console.error("Create product error:", error);
      toast.error(error.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const discount =
    formData.originalPrice &&
    formData.price &&
    parseInt(formData.originalPrice) > parseInt(formData.price)
      ? Math.round(
          ((parseInt(formData.originalPrice) - parseInt(formData.price)) /
            parseInt(formData.originalPrice)) *
            100
        )
      : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-500 mt-1">
            Create a new product in your inventory
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Basic Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Enter brand name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub-Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="subCategoryId"
                  value={formData.subCategoryId}
                  onChange={handleChange}
                  disabled={!formData.categoryId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">Select subcategory</option>
                  {filteredSubCategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
                {!formData.categoryId && (
                  <p className="text-xs text-gray-500 mt-1">
                    Select a category first
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Pricing & Stock
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (NPR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Price (NPR)
              </label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>

          {discount > 0 && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                Discount: {discount}% OFF (Save NPR{" "}
                {(
                  parseInt(formData.originalPrice) - parseInt(formData.price)
                ).toLocaleString()}
                )
              </p>
            </div>
          )}
        </div>

        {/* Reviews & Rating */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Reviews & Rating
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating (0-5)
              </label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                placeholder="0.0"
                min="0"
                max="5"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter rating between 0 and 5
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Reviews
              </label>
              <input
                type="number"
                name="totalReviews"
                value={formData.totalReviews}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Total number of reviews
              </p>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Images</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thumbnail Image <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                placeholder="Enter image URL or filename (e.g., product-1.jpg)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be the main product image
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Images
              </label>
              <div className="space-y-2">
                {formData.images.map((img, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={img}
                      onChange={(e) =>
                        handleArrayChange(index, e.target.value, "images")
                      }
                      placeholder="Enter image URL or filename"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(index, "images")}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem("images")}
                  className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Image
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Variants</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sizes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sizes
              </label>
              <div className="space-y-2">
                {formData.sizes.map((size, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={size}
                      onChange={(e) =>
                        handleArrayChange(index, e.target.value, "sizes")
                      }
                      placeholder="e.g., S, M, L, XL"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {formData.sizes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(index, "sizes")}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem("sizes")}
                  className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Size
                </button>
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Colors
              </label>
              <div className="space-y-2">
                {formData.colors.map((color, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={color}
                      onChange={(e) =>
                        handleArrayChange(index, e.target.value, "colors")
                      }
                      placeholder="e.g., Red, Blue, Black"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {formData.colors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(index, "colors")}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem("colors")}
                  className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Color
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Options */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Additional Options
          </h2>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <div>
              <p className="font-medium text-gray-900">Featured Product</p>
              <p className="text-sm text-gray-500">
                Mark this product as featured on the homepage
              </p>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/admin/products"
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Create Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
