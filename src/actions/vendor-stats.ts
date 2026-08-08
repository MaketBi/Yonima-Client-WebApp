'use server';

import { createServerClient } from '@/lib/supabase/server';
import { getVendorSession } from '@/actions/vendor-auth';

import type { StatsPeriod } from '@/types/vendor';

export interface TopProduct {
  productId: string | null;
  name: string;
  quantity: number;
  revenue: number;
  imageUrl: string | null;
}

export interface CategorySales {
  categoryId: string | null;
  name: string;
  revenue: number;
  percentage: number;
}

export interface VendorStats {
  totalRevenue: number;
  orderCount: number;
  deliveredCount: number;
  averageOrderValue: number;
  /** `null` quand la période précédente est vide — pas de badge affiché. */
  revenueChange: number | null;
  orderCountChange: number | null;
  topProducts: TopProduct[];
  salesByCategory: CategorySales[];
}

const EMPTY_STATS: VendorStats = {
  totalRevenue: 0,
  orderCount: 0,
  deliveredCount: 0,
  averageOrderValue: 0,
  revenueChange: null,
  orderCountChange: null,
  topProducts: [],
  salesByCategory: [],
};

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/**
 * Bornes d'une période, et bornes de la période précédente pour comparaison.
 *
 * ⚠️ L'app iOS calcule un `endDate` mais **ne l'applique jamais** dans ses
 * requêtes : « Hier » y remonte donc aussi aujourd'hui. On applique la borne
 * ici — c'est une correction volontaire.
 */
function resolveRange(period: StatsPeriod, now = new Date()) {
  const today = startOfDay(now);
  let start = new Date(today);
  let end = new Date(now);

  switch (period) {
    case 'today':
      break;
    case 'yesterday':
      start = new Date(today);
      start.setDate(start.getDate() - 1);
      end = new Date(today);
      end.setMilliseconds(-1);
      break;
    case 'last7days':
      start.setDate(start.getDate() - 7);
      break;
    case 'last30days':
      start.setDate(start.getDate() - 30);
      break;
    case 'thisMonth':
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case 'last3months':
      start = new Date(today);
      start.setMonth(start.getMonth() - 3);
      break;
    case 'thisYear':
      start = new Date(today.getFullYear(), 0, 1);
      break;
  }

  // Période précédente : même durée, juste avant.
  const durationMs = end.getTime() - start.getTime();
  const previousEnd = new Date(start.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - durationMs);

  return { start, end, previousStart, previousEnd };
}

function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}

interface OrderRow {
  id: string;
  status: string;
  total: number;
}

/**
 * Statistiques de la période. Tout est agrégé côté serveur — l'app iOS
 * rapatrie chaque commande avec ses articles et calcule côté client, ce qui
 * devient coûteux au fil des mois.
 */
export async function fetchVendorStats(
  period: StatsPeriod
): Promise<{ stats: VendorStats; error?: string }> {
  const session = await getVendorSession();
  if (!session.ok) return { stats: EMPTY_STATS, error: 'Session vendeur introuvable' };

  const vendorId = session.session.vendor.id;
  const supabase = await createServerClient();
  const { start, end, previousStart, previousEnd } = resolveRange(period);

  const [currentResult, previousResult] = await Promise.all([
    supabase
      .from('orders')
      .select('id, status, total')
      .eq('vendor_id', vendorId)
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString()),
    supabase
      .from('orders')
      .select('id, status, total')
      .eq('vendor_id', vendorId)
      .gte('created_at', previousStart.toISOString())
      .lte('created_at', previousEnd.toISOString()),
  ]);

  if (currentResult.error) {
    console.error('[vendor-stats] orders:', currentResult.error.message);
    return { stats: EMPTY_STATS, error: 'Impossible de charger les statistiques' };
  }

  const orders = (currentResult.data ?? []) as OrderRow[];
  const previousOrders = (previousResult.data ?? []) as OrderRow[];

  const delivered = orders.filter((o) => o.status === 'delivered');
  const totalRevenue = delivered.reduce((sum, o) => sum + (o.total ?? 0), 0);
  const deliveredCount = delivered.length;

  const previousDelivered = previousOrders.filter((o) => o.status === 'delivered');
  const previousRevenue = previousDelivered.reduce(
    (sum, o) => sum + (o.total ?? 0),
    0
  );

  // ⚠️ Correction d'un bug iOS : le garde portait sur `orderCount` alors que
  // la division se faisait sur `deliveredCount`.
  const averageOrderValue =
    deliveredCount > 0 ? totalRevenue / deliveredCount : 0;

  const deliveredIds = delivered.map((o) => o.id);

  const [topProducts, salesByCategory] = await Promise.all([
    fetchTopProducts(supabase, deliveredIds),
    fetchSalesByCategory(supabase, deliveredIds),
  ]);

  return {
    stats: {
      totalRevenue,
      orderCount: orders.length,
      deliveredCount,
      averageOrderValue,
      revenueChange: percentChange(totalRevenue, previousRevenue),
      orderCountChange: percentChange(orders.length, previousOrders.length),
      topProducts,
      salesByCategory,
    },
  };
}

type SupabaseClient = Awaited<ReturnType<typeof createServerClient>>;

/** Top 5 par chiffre d'affaires, sur les commandes livrées uniquement. */
async function fetchTopProducts(
  supabase: SupabaseClient,
  orderIds: string[]
): Promise<TopProduct[]> {
  if (orderIds.length === 0) return [];

  const { data, error } = await supabase
    .from('order_items')
    .select('product_id, item_name, quantity, total_price')
    .in('order_id', orderIds);

  if (error) {
    console.error('[vendor-stats] top products:', error.message);
    return [];
  }

  const aggregated = new Map<string, TopProduct>();

  for (const item of data ?? []) {
    const key = (item.product_id as string) ?? (item.item_name as string) ?? 'unknown';
    const existing = aggregated.get(key);

    if (existing) {
      existing.quantity += (item.quantity as number) ?? 0;
      existing.revenue += (item.total_price as number) ?? 0;
    } else {
      aggregated.set(key, {
        productId: (item.product_id as string) ?? null,
        name: (item.item_name as string) ?? 'Produit',
        quantity: (item.quantity as number) ?? 0,
        revenue: (item.total_price as number) ?? 0,
        imageUrl: null,
      });
    }
  }

  const top = [...aggregated.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Visuels, en une seule requête.
  const productIds = top.map((p) => p.productId).filter(Boolean) as string[];
  if (productIds.length > 0) {
    const { data: products } = await supabase
      .from('products')
      .select('id, image_url')
      .in('id', productIds);

    const imagesById = (products ?? []).reduce<Record<string, string | null>>(
      (acc, product) => {
        acc[product.id as string] = (product.image_url as string) ?? null;
        return acc;
      },
      {}
    );

    for (const product of top) {
      if (product.productId) {
        product.imageUrl = imagesById[product.productId] ?? null;
      }
    }
  }

  return top;
}

/** Répartition du CA par catégorie (vue `order_items_detailed`). */
async function fetchSalesByCategory(
  supabase: SupabaseClient,
  orderIds: string[]
): Promise<CategorySales[]> {
  if (orderIds.length === 0) return [];

  const { data, error } = await supabase
    .from('order_items_detailed')
    .select('category_id, category_name, total_price')
    .in('order_id', orderIds);

  if (error) {
    console.error('[vendor-stats] categories:', error.message);
    return [];
  }

  const aggregated = new Map<string, CategorySales>();

  for (const item of data ?? []) {
    const key = (item.category_id as string) ?? 'uncategorized';
    const existing = aggregated.get(key);
    const revenue = (item.total_price as number) ?? 0;

    if (existing) {
      existing.revenue += revenue;
    } else {
      aggregated.set(key, {
        categoryId: key === 'uncategorized' ? null : key,
        name: (item.category_name as string) ?? 'Sans catégorie',
        revenue,
        percentage: 0,
      });
    }
  }

  const rows = [...aggregated.values()].sort((a, b) => b.revenue - a.revenue);
  const total = rows.reduce((sum, row) => sum + row.revenue, 0);

  if (total > 0) {
    for (const row of rows) {
      row.percentage = (row.revenue / total) * 100;
    }
  }

  return rows;
}
