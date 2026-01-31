'use client';

import { ProductCard } from './product-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Package } from 'lucide-react';
import type { Product, Category } from '@/types/models';

interface ProductListProps {
  products: Product[];
  categories?: Category[];
  vendorId: string;
  onProductClick?: (product: Product) => void;
  emptyMessage?: string;
}

export function ProductList({
  products,
  categories,
  vendorId,
  onProductClick,
  emptyMessage,
}: ProductListProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Aucun produit"
        description={emptyMessage || 'Aucun produit disponible pour le moment.'}
      />
    );
  }

  // Group products by category if categories provided
  if (categories && categories.length > 0) {
    const productsByCategory = categories.map((category) => ({
      category,
      products: products.filter((p) => p.category_id === category.id),
    })).filter((group) => group.products.length > 0);

    // Products without category
    const uncategorizedProducts = products.filter(
      (p) => !p.category_id || !categories.find((c) => c.id === p.category_id)
    );

    return (
      <div className="space-y-6">
        {productsByCategory.map(({ category, products: categoryProducts }) => (
          <div key={category.id}>
            <h2 className="text-lg font-semibold mb-3" id={`category-${category.id}`}>
              {category.name}
            </h2>
            <div className="space-y-3">
              {categoryProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  vendorId={vendorId}
                  onClick={() => onProductClick?.(product)}
                />
              ))}
            </div>
          </div>
        ))}

        {uncategorizedProducts.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Autres</h2>
            <div className="space-y-3">
              {uncategorizedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  vendorId={vendorId}
                  onClick={() => onProductClick?.(product)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Simple list without categories
  return (
    <div className="space-y-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          vendorId={vendorId}
          onClick={() => onProductClick?.(product)}
        />
      ))}
    </div>
  );
}
