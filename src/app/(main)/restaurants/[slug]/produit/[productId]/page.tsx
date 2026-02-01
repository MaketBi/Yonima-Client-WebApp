import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getVendor, getProduct } from '@/actions/catalog';
import { APP_NAME, CURRENCY } from '@/lib/constants';

interface Props {
  params: Promise<{ slug: string; productId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, productId } = await params;
  const [vendor, product] = await Promise.all([
    getVendor(slug),
    getProduct(productId),
  ]);

  if (!vendor || !product) {
    return {
      title: 'Produit non trouvé',
    };
  }

  const title = `${product.name} | ${vendor.name} | ${APP_NAME}`;
  const description = `${product.price.toLocaleString('fr-FR')} ${CURRENCY} - Commandez sur ${APP_NAME}`;
  const ogDescription = `${product.price.toLocaleString('fr-FR')} ${CURRENCY} chez ${vendor.name}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yonima.sn';

  return {
    title,
    description,
    openGraph: {
      title: product.name,
      description: ogDescription,
      type: 'website',
      siteName: APP_NAME,
      url: `${siteUrl}/restaurants/${slug}/produit/${productId}`,
      images: product.image_url ? [
        {
          url: product.image_url,
          width: 600,
          height: 600,
          alt: product.name,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: ogDescription,
      images: product.image_url ? [product.image_url] : [],
    },
    alternates: {
      canonical: `/restaurants/${slug}/produit/${productId}`,
    },
  };
}

/**
 * Product detail page - redirects to vendor page with modal open
 * This page exists primarily for SEO (meta tags) and deep linking
 */
export default async function ProductDetailPage({ params }: Props) {
  const { slug, productId } = await params;

  // Redirect to vendor page with product modal open
  redirect(`/restaurants/${slug}?produit=${productId}`);
}
