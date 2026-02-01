'use server';

import { createServerClient } from '@/lib/supabase/server';
import type {
  UserLoyalty,
  LoyaltyTier,
  LoyaltyTransaction,
  LoyaltyReward,
  LoyaltyRedemption,
  LoyaltyConfig,
} from '@/types/models';

/**
 * Get user's loyalty data with current tier
 */
export async function getUserLoyalty(): Promise<UserLoyalty | null> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('user_loyalty')
    .select(`
      *,
      tier:loyalty_tiers(*)
    `)
    .eq('user_id', user.id)
    .single();

  if (error) {
    // If no loyalty record exists, create one
    if (error.code === 'PGRST116') {
      const { data: newLoyalty, error: createError } = await supabase
        .from('user_loyalty')
        .insert({
          user_id: user.id,
          total_points: 0,
          lifetime_points: 0,
        })
        .select(`
          *,
          tier:loyalty_tiers(*)
        `)
        .single();

      if (createError) {
        console.error('Error creating user loyalty:', createError);
        return null;
      }

      return newLoyalty as UserLoyalty;
    }

    console.error('Error fetching user loyalty:', error);
    return null;
  }

  return data as UserLoyalty;
}

/**
 * Get all loyalty tiers
 */
export async function getLoyaltyTiers(): Promise<LoyaltyTier[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('loyalty_tiers')
    .select('*')
    .eq('is_active', true)
    .order('min_points', { ascending: true });

  if (error) {
    console.error('Error fetching loyalty tiers:', error);
    return [];
  }

  return data as LoyaltyTier[];
}

/**
 * Get user's transaction history
 */
export async function getLoyaltyTransactions(
  limit: number = 20
): Promise<LoyaltyTransaction[]> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('loyalty_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching loyalty transactions:', error);
    return [];
  }

  return data as LoyaltyTransaction[];
}

/**
 * Get available rewards
 */
export async function getAvailableRewards(): Promise<LoyaltyReward[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('loyalty_rewards')
    .select('*')
    .eq('is_active', true)
    .order('points_required', { ascending: true });

  if (error) {
    console.error('Error fetching loyalty rewards:', error);
    return [];
  }

  return data as LoyaltyReward[];
}

/**
 * Redeem a reward
 */
export async function redeemReward(
  rewardId: string
): Promise<{ success: boolean; redemption?: LoyaltyRedemption; error?: string }> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Non authentifié' };
  }

  // Get user's current points
  const { data: loyalty, error: loyaltyError } = await supabase
    .from('user_loyalty')
    .select('total_points')
    .eq('user_id', user.id)
    .single();

  if (loyaltyError || !loyalty) {
    return { success: false, error: 'Données de fidélité non trouvées' };
  }

  // Get reward details
  const { data: reward, error: rewardError } = await supabase
    .from('loyalty_rewards')
    .select('*')
    .eq('id', rewardId)
    .eq('is_active', true)
    .single();

  if (rewardError || !reward) {
    return { success: false, error: 'Récompense non trouvée' };
  }

  // Check if user has enough points
  if (loyalty.total_points < reward.points_required) {
    return { success: false, error: 'Points insuffisants' };
  }

  // Create redemption
  const { data: redemption, error: redemptionError } = await supabase
    .from('loyalty_redemptions')
    .insert({
      user_id: user.id,
      reward_id: rewardId,
      points_spent: reward.points_required,
      status: 'pending',
    })
    .select(`
      *,
      reward:loyalty_rewards(*)
    `)
    .single();

  if (redemptionError) {
    console.error('Error creating redemption:', redemptionError);
    return { success: false, error: 'Erreur lors de l\'échange' };
  }

  // Deduct points
  const { error: updateError } = await supabase
    .from('user_loyalty')
    .update({
      total_points: loyalty.total_points - reward.points_required,
    })
    .eq('user_id', user.id);

  if (updateError) {
    console.error('Error updating points:', updateError);
    // Rollback redemption
    await supabase
      .from('loyalty_redemptions')
      .delete()
      .eq('id', redemption.id);
    return { success: false, error: 'Erreur lors de la mise à jour des points' };
  }

  // Create transaction record
  await supabase.from('loyalty_transactions').insert({
    user_id: user.id,
    reward_id: rewardId,
    points: -reward.points_required,
    type: 'spent',
    description: `Échange: ${reward.name}`,
  });

  return { success: true, redemption: redemption as LoyaltyRedemption };
}

/**
 * Get user's pending redemptions
 */
export async function getPendingRedemptions(): Promise<LoyaltyRedemption[]> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('loyalty_redemptions')
    .select(`
      *,
      reward:loyalty_rewards(*)
    `)
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching redemptions:', error);
    return [];
  }

  return data as LoyaltyRedemption[];
}

/**
 * Get loyalty configuration
 */
export async function getLoyaltyConfig(): Promise<LoyaltyConfig | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('loyalty_config')
    .select('*')
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching loyalty config:', error);
    return null;
  }

  return data as LoyaltyConfig;
}
