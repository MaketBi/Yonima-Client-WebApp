'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  EyeOff,
  FolderOpen,
  Plus,
  Search,
  ShoppingBag,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ProductCard } from './product-card';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import type { VendorMenuCategory, VendorProduct } from '@/types/vendor';

const UNCATEGORIZED = '__uncategorized__';

interface CatalogViewProps {
  products: VendorProduct[];
  categories: VendorMenuCategory[];
  canManage: boolean;
  /** CRUD catégories = owner uniquement (policy RLS). */
  canManageCategories: boolean;
  loadError?: string;
}

export function CatalogView({
  products,
  categories,
  canManage,
  canManageCategories,
  loadError,
}: CatalogViewProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        (product.description ?? '').toLowerCase().includes(query);

      const matchesCategory =
        !selectedCategory ||
        (selectedCategory === UNCATEGORIZED
          ? !product.vendor_menu_category_id
          : product.vendor_menu_category_id === selectedCategory);

      return matchesQuery && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  // Une section par catégorie, plus « Sans catégorie » pour les orphelins.
  const sections = useMemo(() => {
    const groups = categories
      .map((category) => ({
        id: category.id,
        name: category.name,
        items: filtered.filter((p) => p.vendor_menu_category_id === category.id),
      }))
      .filter((group) => group.items.length > 0);

    const orphans = filtered.filter((p) => !p.vendor_menu_category_id);
    if (orphans.length > 0) {
      groups.push({ id: UNCATEGORIZED, name: 'Sans catégorie', items: orphans });
    }

    return groups;
  }, [categories, filtered]);

  const activeCount = products.filter((p) => p.is_available).length;
  const hiddenCount = products.length - activeCount;

  const chips = [
    { id: null as string | null, label: 'Tout', count: products.length },
    ...categories.map((category) => ({
      id: category.id,
      label: category.name,
      count: products.filter((p) => p.vendor_menu_category_id === category.id).length,
    })),
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit..."
            className="h-12 rounded-pill border-neutral-300 bg-white pl-10"
            aria-label="Rechercher un produit"
          />
        </div>

        {canManageCategories && (
          <Button asChild variant="outline" className="h-12 rounded-xl">
            <Link href={VENDOR_ROUTES.categories}>
              <FolderOpen className="mr-2 h-4 w-4" />
              Gérer les catégories
            </Link>
          </Button>
        )}

        {canManage && (
          <Button asChild className="h-12 rounded-xl">
            <Link href={VENDOR_ROUTES.produitNouveau}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau produit
            </Link>
          </Button>
        )}
      </div>

      {chips.length > 1 && (
        <div className="flex flex-wrap gap-2.5">
          {chips.map((chip) => {
            const isSelected = selectedCategory === chip.id;
            return (
              <button
                key={chip.id ?? 'all'}
                type="button"
                onClick={() => setSelectedCategory(chip.id)}
                aria-pressed={isSelected}
                className={cn(
                  'inline-flex items-center gap-2 rounded-pill border px-4 py-2 text-[13.5px] font-semibold transition-colors',
                  isSelected
                    ? 'border-green-forest bg-green-forest text-white'
                    : 'border-neutral-200 bg-white text-ink hover:border-green-forest'
                )}
              >
                {chip.label}
                <span
                  className={cn(
                    'rounded-pill px-1.5 py-0.5 text-[11px] font-bold',
                    isSelected ? 'bg-white/25 text-white' : 'bg-neutral-100 text-ink-muted'
                  )}
                >
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-5 text-[13.5px]">
        <span className="inline-flex items-center gap-1.5 font-semibold text-green-deep">
          <CheckCircle2 className="h-4 w-4 text-green-electric" aria-hidden="true" />
          {activeCount} actif{activeCount > 1 ? 's' : ''}
        </span>
        <span className="inline-flex items-center gap-1.5 text-ink-muted">
          <EyeOff className="h-4 w-4" aria-hidden="true" />
          {hiddenCount} masqué{hiddenCount > 1 ? 's' : ''}
        </span>
        <span className="ml-auto text-ink-muted">
          {products.length} produit{products.length > 1 ? 's' : ''}
        </span>
      </div>

      {loadError && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {loadError}
        </p>
      )}

      {products.length === 0 ? (
        <div className="flex flex-col items-center rounded-[18px] bg-white px-6 py-16 text-center shadow-card">
          <ShoppingBag className="h-10 w-10 text-neutral-500" aria-hidden="true" />
          <h2 className="mt-4 text-[17px] font-bold">Votre catalogue est vide</h2>
          <p className="mt-1 text-[14px] text-ink-muted">
            Ajoutez votre premier produit pour commencer à vendre.
          </p>
          {canManage && (
            <Button asChild className="mt-5 rounded-xl">
              <Link href={VENDOR_ROUTES.produitNouveau}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un produit
              </Link>
            </Button>
          )}
        </div>
      ) : sections.length === 0 ? (
        <p className="rounded-[18px] bg-white px-6 py-12 text-center text-[14px] text-ink-muted shadow-card">
          Aucun produit ne correspond à votre recherche.
        </p>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <section key={section.id}>
              <div className="mb-3.5 flex items-center justify-between rounded-[14px] border border-neutral-300 bg-white px-5 py-4">
                <div>
                  <h2 className="text-[16px] font-bold">{section.name}</h2>
                  <p className="text-[12.5px] text-ink-muted">
                    {section.items.length} produit{section.items.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="grid gap-3.5 xl:grid-cols-2">
                {section.items.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    canManage={canManage}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
