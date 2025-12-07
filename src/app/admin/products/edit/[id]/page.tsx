// src/app/admin/products/edit/[id]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  X,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAdminProductById,
  updateProduct,
  deleteProduct,
} from "@/actions/admin/productActions";
import { getAllCategoriesWithCounts } from "@/actions/admin/categoryActions";
import { getAllSubCategoriesFull } from "@/actions/admin/subCategoryActions";
import ImageUpload from "@/components/admin/ImageUpload";
import MultipleImageUpload from "@/components/admin/MultipleImageUpload";

interface CategoryOption {
  id: string;
  name: string;
}

interface SubCategoryOption {
  id: string;
  name: string;
  categoryId: string;
}

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ Unwrap params using React.use() (required in Next.js 15+ Client Components)
  const { id: productId } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategoryOption[]>([]);

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
    images: [] as string[],
    sizes: [""],
    colors: [""],
    stock: "",
    rating: "",
    totalReviews: "",
  });

  // ✅ Fetch product + categories + subcategories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productResult, catsData, subCatsData] = await Promise.all([
          getAdminProductById(productId),
          getAllCategoriesWithCounts(),
          getAllSubCategoriesFull(),
        ]);

        if (!productResult.success || !productResult.product) {
          toast.error("Product not found");
          router.push("/admin/products");
          return;
        }

        const product = productResult.product;

        // Set form data — ensure nulls become empty strings
        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product.price?.toString() || "",
          originalPrice: product.originalPrice?.toString() || "",
          brand: product.brand || "",
          categoryId: product.categoryId || "",
          subCategoryId: product.subCategoryId || "",
          isFeatured: !!product.isFeatured,
          thumbnail: product.thumbnail || "",
          images: product.images?.length > 0 ? [...product.images] : [],
          sizes: product.sizes?.length > 0 ? [...product.sizes] : [""],
          colors: product.colors?.length > 0 ? [...product.colors] : [""],
          stock: product.stock?.toString() || "",
          rating: product.rating?.toString() || "",
          totalReviews: product.totalReviews?.toString() || "",
        });

        // Set categories
        if (catsData.success && Array.isArray(catsData.categories)) {
          setCategories(
            catsData.categories.map((cat) => ({
              id: cat.id,
              name: cat.name,
            }))
          );
        }

        // Set subcategories
        if (subCatsData.success && Array.isArray(subCatsData.subcategories)) {
          setSubCategories(
            subCatsData.subcategories.map((sub) => ({
              id: sub.id,
              name: sub.name,
              categoryId: sub.categoryId,
            }))
          );
        }
      } catch (error: any) {
        console.error("Failed to fetch product data:", error);
        toast.error("Failed to load product. Please try again.");
        router.push("/admin/products");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId, router]);

  // ✅ Compute filtered subcategories IN RENDER (no useEffect timing issues)
  const filteredSubCategories = subCategories.filter(
    (sub) => sub.categoryId === formData.categoryId
  );

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
    field: "sizes" | "colors"
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayItem = (field: "sizes" | "colors") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayItem = (index: number, field: "sizes" | "colors") => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.description ||
      !formData.price ||
      !formData.categoryId ||
      !formData.thumbnail ||
      !formData.stock
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    try {
      const data = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseInt(formData.price, 10),
        originalPrice: formData.originalPrice
          ? parseInt(formData.originalPrice, 10)
          : undefined,
        brand: formData.brand.trim() || undefined,
        categoryId: formData.categoryId,
        subCategoryId: formData.subCategoryId,
        isFeatured: formData.isFeatured,
        thumbnail: formData.thumbnail.trim(),
        images: formData.images.filter((img) => img.trim() !== ""),
        sizes: formData.sizes.filter((size) => size.trim() !== ""),
        colors: formData.colors.filter((color) => color.trim() !== ""),
        stock: parseInt(formData.stock, 10),
        rating: formData.rating ? parseFloat(formData.rating) : undefined,
        totalReviews: formData.totalReviews
          ? parseInt(formData.totalReviews, 10)
          : undefined,
      };

      const result = await updateProduct(productId, data);
      toast.success(result.message || "Product updated successfully!");
      router.push("/admin/products");
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeleting(true);

    try {
      const result = await deleteProduct(productId);
      toast.success(result.message || "Product deleted successfully!");
      router.push("/admin/products");
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete product");
      setDeleting(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-500 mt-1">Update product information</p>
          </div>
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting || submitting}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deleting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="w-5 h-5" />
              Delete
            </>
          )}
        </button>
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
                  Sub-Category
                </label>
                <select
                  name="subCategoryId"
                  value={formData.subCategoryId}
                  onChange={handleChange}
                  disabled={!formData.categoryId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
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
                    Please select a category first
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
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

          <div className="space-y-6">
            {/* Thumbnail Image */}
            <ImageUpload
              value={formData.thumbnail}
              onChange={(url) =>
                setFormData((prev) => ({ ...prev, thumbnail: url }))
              }
              label="Thumbnail Image"
              required
              helperText="This will be the main product image"
            />

            {/* Additional Images */}
            <MultipleImageUpload
              images={formData.images}
              onChange={(images) =>
                setFormData((prev) => ({ ...prev, images }))
              }
              label="Additional Images"
              maxImages={10}
            />
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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
            disabled={submitting || deleting}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Update Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}