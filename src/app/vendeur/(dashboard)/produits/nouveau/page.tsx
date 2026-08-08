import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getVendorSession } from '@/actions/vendor-auth';
import { fetchVendorCategories } from '@/actions/vendor-products';
import { ProductForm } from '@/components/vendor/products/product-form';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';

export const metadata: Metadata = { title: 'Nouveau produit' };
export const dynamic = 'force-dynamic';

export default async function VendeurNouveauProduitPage() {
  const session = await getVendorSession();
  if (!session.ok) return null;

  if (!session.session.permissions.can_manage_products) {
    redirect(VENDOR_ROUTES.produits);
  }

  const { categories } = await fetchVendorCategories();

  return (
    <ProductForm
      categories={categories}
      vendorType={session.session.vendor.type}
    />
  );
}
