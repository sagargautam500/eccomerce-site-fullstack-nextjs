// src/app/(public)/products/[id]/page.tsx
import { getProductById, getRelatedProducts } from "@/actions/api/productApi";
import ProductCard from "@/components/products/ProductCard";
import ProductDetails from "@/components/products/ProductDetails";
import { notFound } from "next/navigation";

// ✅ Make the component async and await params
export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>; // ✅ Type as Promise
}) {
  // ✅ AWAIT params to get the actual object
  const { id } = await params;

  if (!id || id === "undefined" || id === "null") {
    notFound();
  }

  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(
    product.id,
    product.categoryId,
    4
  );

  return (
    <div>
      <ProductDetails product={product} />

      {relatedProducts.length > 0 && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ Also fix generateMetadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>; // ✅ Promise type
}) {
  // ✅ AWAIT params
  const { id } = await params;

  if (!id || id === "undefined" || id === "null") {
    return {
      title: "Product Not Found - Chimteshwar Shop",
    };
  }

  try {
    const product = await getProductById(id);

    if (!product) {
      return {
        title: "Product Not Found - Chimteshwar Shop",
      };
    }

    return {
      title: `${product.name} - Chimteshwar Shop`,
      description: product.description?.substring(0, 160) || "Shop premium products in Nepal",
      openGraph: {
        title: product.name,
        description: product.description?.substring(0, 160) || "Shop premium products in Nepal",
        images: [
          {
            url: product.thumbnail?.startsWith("http")
              ? product.thumbnail
              : `/products/${product.thumbnail}`,
            width: 800,
            height: 600,
            alt: product.name,
          },
        ],
      },
    };
  } catch (error) {
    return {
      title: "Product - Chimteshwar Shop",
      description: "Shop premium products in Nepal",
    };
  }
}