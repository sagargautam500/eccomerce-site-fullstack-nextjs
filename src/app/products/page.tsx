// src/app/products/page.tsx
import { getAllCategories, getAllSubCategories } from "@/actions/api/categoryApi";
import ProductsClient from "@/components/products/ProductClient";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const categories = await getAllCategories();
  const subCategories = await getAllSubCategories();

  return (
    <ProductsClient
      categories={categories}
      subCategories={subCategories}
      searchParams={searchParams}
    />
  );
}