'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search as SearchIcon } from 'lucide-react';
import { searchCatalog } from '@/actions/catalog';
import { SearchField } from '@/components/yonima/search-field';
import { RestaurantCard } from '@/components/yonima/restaurant-card';
import { SafeImage } from '@/components/shared/safe-image';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/utils';
import type { Vendor, Product } from '@/types/models';

/**
 * searchCatalog joins each product with a slim vendor (id, name, type) via
 * `vendor:vendors(...)`. The base Product type doesn't declare that relation,
 * so we widen it locally.
 */
type ProductWithVendor = Product & {
  vendor?: Pick<Vendor, 'id' | 'name' | 'type' | 'slug'> | null;
};

/** Vendor detail URL: restaurants and commerces live under different paths. */
function vendorHref(vendor: Pick<Vendor, 'type' | 'slug' | 'id'>): string {
  const base = vendor.type === 'restaurant' ? 'restaurants' : 'commerces';
  return `/${base}/${vendor.slug || vendor.id}`;
}

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

export default function SearchPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ vendors: Vendor[]; products: ProductWithVendor[] }>({
    vendors: [],
    products: [],
  });
  const [searched, setSearched] = useState(false);

  // Autofocus the field on mount (search is the primary action of this screen).
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const runSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults({ vendors: [], products: [] });
      setSearched(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await searchCatalog(trimmed);
      setResults(data);
      setSearched(true);
    } catch {
      setResults({ vendors: [], products: [] });
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce live search on every keystroke.
  useEffect(() => {
    const id = setTimeout(() => runSearch(query), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [query, runSearch]);

  const hasResults = results.vendors.length > 0 || results.products.length > 0;

  return (
    <div className="container py-4">
      {/* Search bar row with a back button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Retour"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-neutral-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <form
          className="flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(query);
          }}
        >
          <SearchField
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Plat, resto, cuisine…"
            aria-label="Rechercher"
          />
        </form>
      </div>

      {/* States */}
      <div className="mt-6">
        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-lg" />
            ))}
          </div>
        )}

        {!loading && query.trim().length < MIN_QUERY_LENGTH && (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-ink-muted">
            <SearchIcon className="h-8 w-8" aria-hidden="true" />
            <p className="text-sm">Tape au moins {MIN_QUERY_LENGTH} caractères pour chercher un plat, un resto ou un commerce.</p>
          </div>
        )}

        {!loading && searched && !hasResults && (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-ink-muted">
            <SearchIcon className="h-8 w-8" aria-hidden="true" />
            <p className="text-sm">
              Aucun résultat pour «&nbsp;{query.trim()}&nbsp;».
            </p>
          </div>
        )}

        {!loading && hasResults && (
          <div className="space-y-8">
            {/* Vendors */}
            {results.vendors.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-muted">
                  Restaurants &amp; commerces
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {results.vendors.map((vendor) => (
                    <RestaurantCard
                      key={vendor.id}
                      vendor={vendor}
                      href={vendorHref(vendor)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Products */}
            {results.products.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-muted">
                  Plats &amp; produits
                </h2>
                <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-white">
                  {results.products.map((product) => {
                    const vendor = product.vendor;
                    const href = vendor ? vendorHref(vendor) : '#';
                    return (
                      <li key={product.id}>
                        <Link
                          href={href}
                          className="flex items-center gap-3 p-3 transition-colors hover:bg-neutral-50"
                        >
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-bg-warm">
                            <SafeImage
                              src={product.image_url || ''}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="56px"
                              fallback={<span className="text-xl">🍽️</span>}
                              fallbackClassName="absolute inset-0 bg-bg-warm"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[15px] font-semibold leading-tight line-clamp-1">
                              {product.name}
                            </p>
                            {vendor?.name && (
                              <p className="mt-0.5 text-xs text-ink-muted line-clamp-1">
                                {vendor.name}
                              </p>
                            )}
                          </div>
                          <span className="shrink-0 text-sm font-bold text-green-forest">
                            {formatPrice(product.price)}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
