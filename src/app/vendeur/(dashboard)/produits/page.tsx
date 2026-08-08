import type { Metadata } from 'next';
import { getVendorSession } from '@/actions/vendor-auth';
import {
  fetchVendorCategories,
  fetchVendorProducts,
} from '@/actions/vendor-products';
import { CatalogView } from '@/components/vendor/products/catalog-view';

export const metadata: Metadata = { title: 'Catalogue' };
export const dynamic = 'force-dynamic';

export default async function VendeurProduitsPage() {
  const session = await getVendorSession();
  if (!session.ok) return null;

  const [{ products, error }, { categories }] = await Promise.all([
    fetchVendorProducts(),
    fetchVendorCategories(),
  ]);

  return (
    <CatalogView
      products={products}
      categories={categories}
      canManage={session.session.permissions.can_manage_products}
      canManageCategories={session.session.isOwner}
      loadError={error}
    />
  );
}
