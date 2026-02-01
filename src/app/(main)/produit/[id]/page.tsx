import { notFound, redirect } from 'next/navigation';
import { getProduct, getVendor } from '@/actions/catalog';

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Legacy product page - redirects to new SEO-friendly URL
 * /produit/[id] -> /restaurants/[slug]/produit/[id] or /commerces/[slug]/produit/[id]
 */
export default async function LegacyProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  // Get vendor to build the new URL
  const vendor = await getVendor(product.vendor_id);

  if (!vendor) {
    notFound();
  }

  // Redirect based on vendor type
  const basePath = vendor.type === 'restaurant' ? 'restaurants' : 'commerces';
  redirect(`/${basePath}/${vendor.slug}/produit/${id}`);
}
