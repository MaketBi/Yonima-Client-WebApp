import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getVendor, getPack } from '@/actions/catalog';
import { APP_NAME, CURRENCY } from '@/lib/constants';

interface Props {
  params: Promise<{ slug: string; packId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, packId } = await params;
  const [vendor, pack] = await Promise.all([
    getVendor(slug),
    getPack(packId),
  ]);

  if (!vendor || !pack) {
    return {
      title: 'Pack non trouvé',
    };
  }

  const title = `${pack.name} | ${vendor.name} | ${APP_NAME}`;
  const description = `${pack.price.toLocaleString('fr-FR')} ${CURRENCY} - Commandez sur ${APP_NAME}`;
  const ogDescription = `${pack.price.toLocaleString('fr-FR')} ${CURRENCY} chez ${vendor.name}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yonima.sn';

  return {
    title,
    description,
    openGraph: {
      title: pack.name,
      description: ogDescription,
      type: 'website',
      siteName: APP_NAME,
      url: `${siteUrl}/restaurants/${slug}/pack/${packId}`,
      images: pack.image_url ? [
        {
          url: pack.image_url,
          width: 600,
          height: 600,
          alt: pack.name,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: pack.name,
      description: ogDescription,
      images: pack.image_url ? [pack.image_url] : [],
    },
    alternates: {
      canonical: `/restaurants/${slug}/pack/${packId}`,
    },
  };
}

/**
 * Pack detail page - redirects to vendor page with modal open
 * This page exists primarily for SEO (meta tags) and deep linking
 */
export default async function PackDetailPage({ params }: Props) {
  const { slug, packId } = await params;

  // Redirect to vendor page with pack modal open
  redirect(`/restaurants/${slug}?pack=${packId}`);
}
