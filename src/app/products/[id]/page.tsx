// src/app/products/[id]/page.tsx (updated)
import { getProductById } from "@/actions/api/productApi";
import ProductDetails from "@/components/ProductDetails";
import { notFound } from "next/navigation";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

// console.log(product);

  return (
    <ProductDetails product={product}/>
  )
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