import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getVendorSession } from '@/actions/vendor-auth';
import {
  fetchVendorCategories,
  fetchVendorProduct,
} from '@/actions/vendor-products';
import { ProductForm } from '@/components/vendor/products/product-form';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { product } = await fetchVendorProduct(id);
  return { title: product ? product.name : 'Produit' };
}

export default async function VendeurModifierProduitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getVendorSession();
  if (!session.ok) return null;

  if (!session.session.permissions.can_manage_products) {
    redirect(VENDOR_ROUTES.produits);
  }

  const [{ product }, { categories }] = await Promise.all([
    fetchVendorProduct(id),
    fetchVendorCategories(),
  ]);

  if (!product) notFound();

  return (
    <ProductForm
      categories={categories}
      vendorType={session.session.vendor.type}
      product={product}
    />
  );
}
