import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/auth';
import {
  getUserLoyalty,
  getLoyaltyTiers,
  getLoyaltyTransactions,
  getAvailableRewards,
  getPendingRedemptions,
  getLoyaltyConfig,
} from '@/actions/loyalty';
import { LoyaltyDashboard } from '@/components/loyalty/loyalty-dashboard';

export const metadata: Metadata = {
  title: 'Ma fidélité',
  description: 'Gérez vos points de fidélité et échangez vos récompenses',
};

export default async function FidelitePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?redirect=/fidelite');
  }

  const [userLoyalty, tiers, transactions, rewards, pendingRedemptions, config] =
    await Promise.all([
      getUserLoyalty(),
      getLoyaltyTiers(),
      getLoyaltyTransactions(),
      getAvailableRewards(),
      getPendingRedemptions(),
      getLoyaltyConfig(),
    ]);

  return (
    <LoyaltyDashboard
      userLoyalty={userLoyalty}
      tiers={tiers}
      transactions={transactions}
      rewards={rewards}
      pendingRedemptions={pendingRedemptions}
      config={config}
    />
  );
}
