// src/app/products/page.tsx
import { getAllProducts } from "@/actions/api/productApi";
import { getAllCategories, getAllSubCategories } from "@/actions/api/categoryApi";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types/product";

export default async function ProductsPage() {
  const [products, categories, subCategories] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
    getAllSubCategories(),
  ]);

  // Create lookup maps for better performance
  const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
  const subCategoryMap = new Map(subCategories.map(sub => [sub.id, sub]));
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">All Products</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p: Product) => (
          <ProductCard 
            key={p.id} 
            product={p}
            categoryName={categoryMap.get(p.categoryId)?.name}
            subCategoryName={subCategoryMap.get(p.subCategoryId)?.name}
          />
        ))}
      </div>
    </div>
  );
}