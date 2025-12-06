// src/app/products/page.tsx (Fixed for Next.js 15+)
import { getAllCategories, getAllSubCategories } from "@/actions/api/categoryApi";
import { getAllProducts } from "@/actions/api/productApi";
import ProductsClient from "@/components/products/ProductClient";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // ✅ Await searchParams in Next.js 15+
  const params = await searchParams;

  // Fetch all data on server side
  const [categories, subCategories, initialData] = await Promise.all([
    getAllCategories(),
    getAllSubCategories(),
    getAllProducts({
      search: params.search as string,
      categoryId: params.categoryId as string,
      subCategoryId: params.subCategoryId as string,
      minPrice: params.minPrice as string,
      maxPrice: params.maxPrice as string,
      page: Number(params.page) || 1,
      limit: 12,
    }),
  ]);

  return (
    <ProductsClient
      categories={categories}
      subCategories={subCategories}
      initialData={initialData}
      searchParams={params}
    />
  );
}