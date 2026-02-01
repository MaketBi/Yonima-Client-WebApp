import { notFound, redirect } from 'next/navigation';
import { getPack, getVendor } from '@/actions/catalog';

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Legacy pack page - redirects to new SEO-friendly URL
 * /pack/[id] -> /restaurants/[slug]/pack/[id] or /commerces/[slug]/pack/[id]
 */
export default async function LegacyPackPage({ params }: Props) {
  const { id } = await params;
  const pack = await getPack(id);

  if (!pack) {
    notFound();
  }

  // Get vendor to build the new URL
  const vendor = await getVendor(pack.vendor_id);

  if (!vendor) {
    notFound();
  }

  // Redirect based on vendor type
  const basePath = vendor.type === 'restaurant' ? 'restaurants' : 'commerces';
  redirect(`/${basePath}/${vendor.slug}/pack/${id}`);
}
