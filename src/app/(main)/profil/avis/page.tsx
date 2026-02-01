import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/auth';
import { getUserReviews, getReviewableOrders } from '@/actions/reviews';
import { MyReviews } from '@/components/reviews/my-reviews';

export const metadata: Metadata = {
  title: 'Mes avis',
  description: 'Gérez vos avis et évaluez vos commandes',
};

export default async function MyReviewsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?redirect=/profil/avis');
  }

  const [reviews, reviewableOrders] = await Promise.all([
    getUserReviews(),
    getReviewableOrders(),
  ]);

  return <MyReviews reviews={reviews} reviewableOrders={reviewableOrders} />;
}
