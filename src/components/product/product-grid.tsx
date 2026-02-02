'use client';

import { ProductCardGrid } from './product-card-grid';
import { EmptyState } from '@/components/shared/empty-state';
import { Package } from 'lucide-react';
import type { Product, VendorCategory, Vendor } from '@/types/models';

interface ProductGridProps {
  products: Product[];
  categories?: VendorCategory[];
  vendorId: string;
  vendor?: Vendor;
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  categories,
  vendorId,
  vendor,
  emptyMessage,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Aucun produit"
        description={emptyMessage || 'Aucun produit disponible pour le moment.'}
      />
    );
  }

  // Group products by vendor_category if categories provided
  if (categories && categories.length > 0) {
    const productsByCategory = categories.map((category) => ({
      category,
      products: products.filter((p) => p.vendor_category_id === category.id),
    })).filter((group) => group.products.length > 0);

    // Products without category
    const uncategorizedProducts = products.filter(
      (p) => !p.vendor_category_id || !categories.find((c) => c.id === p.vendor_category_id)
    );

    return (
      <div className="space-y-8">
        {productsByCategory.map(({ category, products: categoryProducts }) => (
          <div key={category.id}>
            <h2
              className="text-lg font-semibold mb-4 px-4"
              id={`category-${category.id}`}
            >
              {category.name}
            </h2>
            <div className="grid grid-cols-2 gap-3 px-4">
              {categoryProducts.map((product) => (
                <ProductCardGrid
                  key={product.id}
                  product={product}
                  vendorId={vendorId}
                  vendor={vendor}
                />
              ))}
            </div>
          </div>
        ))}

        {uncategorizedProducts.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 px-4">Autres</h2>
            <div className="grid grid-cols-2 gap-3 px-4">
              {uncategorizedProducts.map((product) => (
                <ProductCardGrid
                  key={product.id}
                  product={product}
                  vendorId={vendorId}
                  vendor={vendor}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Simple grid without categories
  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      {products.map((product) => (
        <ProductCardGrid
          key={product.id}
          product={product}
          vendorId={vendorId}
          vendor={vendor}
        />
      ))}
    </div>
  );
}
