import type { Metadata } from 'next';
import { getVendorSession } from '@/actions/vendor-auth';
import { fetchVendorReviews } from '@/actions/vendor-reviews';
import { ReviewsView } from '@/components/vendor/reviews/reviews-view';

export const metadata: Metadata = { title: 'Avis clients' };
export const dynamic = 'force-dynamic';

export default async function VendeurAvisPage() {
  const session = await getVendorSession();
  if (!session.ok) return null;

  const { reviews } = await fetchVendorReviews();

  return (
    <ReviewsView reviews={reviews} canRespond={session.session.isOwner} />
  );
}
