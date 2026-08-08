import type { Metadata } from 'next';
import { getVendorSession } from '@/actions/vendor-auth';
import { fetchVendorCategoryRows } from '@/actions/vendor-categories';
import {
  fetchMenuCategoryRefs,
  fetchVendorProducts,
} from '@/actions/vendor-products';
import { CategoriesView } from '@/components/vendor/products/categories-view';

export const metadata: Metadata = { title: 'Catégories' };
export const dynamic = 'force-dynamic';

export default async function VendeurCategoriesPage() {
  const session = await getVendorSession();
  if (!session.ok) return null;

  const [categories, kinds, { products }] = await Promise.all([
    fetchVendorCategoryRows(),
    fetchMenuCategoryRefs(),
    fetchVendorProducts(),
  ]);

  // Compter sur `vendor_menu_category_id` (colonne actuelle), pas
  // `vendor_category_id` qui est legacy.
  const productCounts = products.reduce<Record<string, number>>((acc, product) => {
    if (product.vendor_menu_category_id) {
      acc[product.vendor_menu_category_id] =
        (acc[product.vendor_menu_category_id] ?? 0) + 1;
    }
    return acc;
  }, {});

  return (
    <CategoriesView
      categories={categories}
      kinds={kinds}
      productCounts={productCounts}
      canManage={session.session.isOwner}
    />
  );
}
