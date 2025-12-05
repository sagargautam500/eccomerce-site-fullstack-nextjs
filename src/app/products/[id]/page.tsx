// src/app/products/[id]/page.tsx
import { getProductById, getRelatedProducts } from "@/actions/api/productApi";
import ProductCard from "@/components/products/ProductCard";
import ProductDetails from "@/components/products/ProductDetails";
import { notFound } from "next/navigation";

export default async function ProductDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProductById(params.id);

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

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
      return {
        title: "Product Not Found - Chimteshwar Shop",
      };
    }

    return {
      title: `${product.name} - Chimteshwar Shop`,
      description: product.description,
      openGraph: {
        title: product.name,
        description: product.description,
        images: [
          product.thumbnail?.startsWith("http")
            ? product.thumbnail
            : `/products/${product.thumbnail}`,
        ],
      },
    };
  } catch (error) {
    return {
      title: "Product - Chimteshwar Shop",
    };
  }
}