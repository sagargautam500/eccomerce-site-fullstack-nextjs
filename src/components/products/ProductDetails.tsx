// src/components/ProductDetails.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Product } from "@/types/product";
import { cn } from "@/lib/utils";
import { toast } from "sonner";



// Image Gallery Component
const ImageGallery = ({
  images,
  productName,
  selectedIndex,
  onSelect,
  discount,
  isFeatured,
}: {
  images: string[];
  productName: string;
  selectedIndex: number;
  onSelect: (index: number) => void;
  discount: number;
  isFeatured: boolean;
}) => {
  const getImageSrc = (img: string) =>
    img?.startsWith("http") ? img : `/products/${img}`;

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
        <Image
          src={getImageSrc(images[selectedIndex])}
          alt={productName}
          fill
          className="object-cover"
          priority
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isFeatured && (
            <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Featured
            </span>
          )}
          {discount > 0 && (
            <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              -{discount}%
            </span>
          )}
        </div>

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={() =>
                onSelect(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1)
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow hover:bg-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() =>
                onSelect(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow hover:bg-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              className={cn(
                "aspect-square rounded-lg overflow-hidden border-2 transition-all",
                selectedIndex === idx
                  ? "border-orange-500 ring-2 ring-orange-200"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <Image
                src={getImageSrc(img)}
                alt={`${productName} ${idx + 1}`}
                width={100}
                height={100}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Variant Selector Component
const VariantSelector = ({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) => {
  if (!options || options.length === 0) return null;

  return (
    <div>
      <label className="text-sm font-semibold text-gray-900 mb-2 block">
        {label}: <span className="text-orange-600">{selected}</span>
      </label>
      <div className="flex gap-2 flex-wrap">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onSelect(option)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all",
              selected === option
                ? "border-orange-500 bg-orange-50 text-orange-600"
                : "border-gray-200 hover:border-orange-300 text-gray-700"
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

// Quantity Selector Component
const QuantitySelector = ({
  quantity,
  stock,
  onChange,
}: {
  quantity: number;
  stock: number;
  onChange: (value: number) => void;
}) => (
  <div>
    <label className="text-sm font-semibold text-gray-900 mb-2 block">Quantity</label>
    <div className="flex items-center gap-3">
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
        <button
          onClick={() => onChange(Math.max(1, quantity - 1))}
          className="p-2.5 hover:bg-gray-100 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="px-5 py-2.5 font-semibold text-center min-w-[3rem] bg-gray-50">
          {quantity}
        </span>
        <button
          onClick={() => onChange(Math.min(stock, quantity + 1))}
          className="p-2.5 hover:bg-gray-100 transition-colors"
          disabled={quantity >= stock}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <span className="text-sm text-gray-500">{stock} available</span>
    </div>
  </div>
);

// Trust Badges Component
const TrustBadges = () => {
  const badges = [
    { icon: Truck, label: "Free Shipping", color: "bg-green-100 text-green-600" },
    { icon: Shield, label: "Secure Payment", color: "bg-blue-100 text-blue-600" },
    { icon: RefreshCw, label: "Easy Returns", color: "bg-purple-100 text-purple-600" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
      {badges.map(({ icon: Icon, label, color }) => (
        <div key={label} className="text-center">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1",
              color
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-medium text-gray-600">{label}</p>
        </div>
      ))}
    </div>
  );
};

// Main Component
export default function ProductDetails({
  product
}: { product: Product }) {
  const router = useRouter();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const addToCart = useCartStore((s) => s.addToCart);
  const getItemQuantity = useCartStore((s) => s.getItemQuantity);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();


  useEffect(() => {
    // Initialize variants
    if (product.sizes?.length) setSelectedSize(product.sizes[0]);
    if (product.colors?.length) setSelectedColor(product.colors[0]);

    // Check wishlist status
    setIsWishlisted(isInWishlist(product.id));
  }, [product, isInWishlist]);

  const images = product.images?.length ? product.images : [product.thumbnail];
  const cartQuantity = getItemQuantity(product.id, selectedSize, selectedColor);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await addToCart({
        productId: product.id,
        quantity,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          thumbnail: product.thumbnail,
          stock: product.stock,
          category: product.category?.name || product.categoryId,
        },
      });
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    setAddingToCart(true);
    try {
      const success = await addToCart({
        productId: product.id,
        quantity,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          thumbnail: product.thumbnail,
          stock: product.stock,
          category: product.category?.name || product.categoryId,
        },
      });

      if (success) {
        router.push("/cart");
      }
    } catch (error) {
      console.error("Buy now error:", error);
      toast.error("Failed to process purchase");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    try {
      if (!isWishlisted) {
        await addToWishlist({
          productId: product.id,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            thumbnail: product.thumbnail,
            stock: product.stock,
            category: product.category?.name || product.categoryId,
          },
        });
        setIsWishlisted(true);
      } else {
        await removeFromWishlist(product.id);
        setIsWishlisted(false);
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      toast.error("Failed to update wishlist");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-4 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-5 lg:p-8">
            {/* Left - Images */}
            <ImageGallery
              images={images}
              productName={product.name}
              selectedIndex={selectedImage}
              onSelect={setSelectedImage}
              discount={discount}
              isFeatured={product.isFeatured}
            />

            {/* Right - Details */}
            <div className="space-y-5">
              {/* Category & Subcategory & Brand */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {product.category?.name && (
                  <span className="uppercase font-medium">{product.category.name}</span>
                )}
                {product.category?.name && product.subCategory?.name && <span>•</span>}
                {product.subCategory?.name && (
                  <span className="uppercase font-medium">{product.subCategory.name}</span>
                )}
                {(product.category?.name || product.subCategory?.name) && product.brand && <span>•</span>}
                {product.brand && <span>{product.brand}</span>}
              </div>

              {/* Title */}
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {product.name}
              </h1>

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-4 h-4",
                          i < Math.floor(product.rating!)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.totalReviews} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="border-y border-gray-100 py-4">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-bold text-gray-900">
                    NPR {product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <>
                      <span className="text-lg line-through text-gray-400">
                        NPR {product.originalPrice.toLocaleString()}
                      </span>
                      <span className="text-sm font-semibold text-green-600">
                        Save NPR{" "}
                        {(product.originalPrice - product.price).toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
                {product.stock > 0 && product.stock <= 5 && (
                  <p className="text-orange-600 text-sm font-medium mt-2">
                    ⚠️ Only {product.stock} left!
                  </p>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed">
                {product.description}
              </p>

              {/* Variants */}
              <VariantSelector
                label="Size"
                options={product.sizes}
                selected={selectedSize}
                onSelect={setSelectedSize}
              />
              <VariantSelector
                label="Color"
                options={product.colors}
                selected={selectedColor}
                onSelect={setSelectedColor}
              />

              {/* Quantity */}
              <QuantitySelector
                quantity={quantity}
                stock={product.stock}
                onChange={setQuantity}
              />

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addingToCart}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all",
                    product.stock === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 shadow-md hover:shadow-lg"
                  )}
                >
                  {addingToCart ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-5 h-5" />
                  )}
                  {product.stock === 0
                    ? "Out of Stock"
                    : addingToCart
                    ? "Adding..."
                    : cartQuantity > 0
                    ? `In Cart (${cartQuantity}) - Add More`
                    : "Add to Cart"}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0 || addingToCart}
                    className="px-6 py-3.5 rounded-xl font-semibold border-2 border-orange-500 text-orange-600 hover:bg-orange-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Buy Now
                  </button>

                  <button
                    onClick={handleWishlist}
                    className={cn(
                      "flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold border-2 transition-all",
                      isWishlisted
                        ? "border-red-500 bg-red-50 text-red-600"
                        : "border-gray-300 text-gray-700 hover:border-red-300 hover:bg-red-50"
                    )}
                  >
                    <Heart
                      className={cn("w-5 h-5", isWishlisted && "fill-red-500")}
                    />
                    <span className="hidden sm:inline">
                      {isWishlisted ? "Saved" : "Save"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Trust Badges */}
              <TrustBadges />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}