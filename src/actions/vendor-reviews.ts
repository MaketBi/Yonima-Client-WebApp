'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase/server';
import { getVendorSession } from '@/actions/vendor-auth';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import type { VendorReview } from '@/types/vendor';

/**
 * Avis de la boutique. Seuls les avis `approved` sont exposés au vendeur.
 *
 * ⚠️ Les policies `reviews` ne couvrent que le **propriétaire**
 * (`vendors.owner_id = auth.uid()`) : un assistant obtiendra une liste vide,
 * quelle que soit sa permission applicative.
 */
export async function fetchVendorReviews(): Promise<{
  reviews: VendorReview[];
  error?: string;
}> {
  const session = await getVendorSession();
  if (!session.ok) return { reviews: [], error: 'Session vendeur introuvable' };

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('reviews')
    .select(
      'id, user_id, order_id, vendor_rating, food_rating, delivery_rating, comment, vendor_response, vendor_response_at, is_verified_purchase, is_anonymous, created_at, user:users!reviews_user_id_fkey(id, phone, full_name)'
    )
    .eq('vendor_id', session.session.vendor.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    // Table absente ou vue non déployée : liste vide plutôt qu'une erreur
    // bloquante, comme l'app iOS.
    console.error('[vendor-reviews] fetch:', error.message);
    return { reviews: [] };
  }

  return { reviews: (data ?? []) as unknown as VendorReview[] };
}

/** Publie ou modifie la réponse du vendeur (2 colonnes sur `reviews`). */
export async function respondToReview(
  reviewId: string,
  response: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getVendorSession();
  if (!session.ok) return { success: false, error: 'Session vendeur introuvable' };

  if (!session.session.isOwner) {
    return {
      success: false,
      error: 'Seul le propriétaire de la boutique peut répondre aux avis',
    };
  }

  const trimmed = response.trim();
  if (!trimmed) return { success: false, error: 'La réponse ne peut pas être vide' };
  if (trimmed.length > 500) {
    return { success: false, error: 'La réponse ne doit pas dépasser 500 caractères' };
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from('reviews')
    .update({
      vendor_response: trimmed,
      vendor_response_at: new Date().toISOString(),
    })
    .eq('id', reviewId)
    .eq('vendor_id', session.session.vendor.id);

  if (error) {
    console.error('[vendor-reviews] respond:', error.message);
    return { success: false, error: "Impossible d'envoyer la réponse" };
  }

  revalidatePath(VENDOR_ROUTES.avis);
  return { success: true };
}

export async function deleteReviewResponse(
  reviewId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getVendorSession();
  if (!session.ok) return { success: false, error: 'Session vendeur introuvable' };

  if (!session.session.isOwner) {
    return {
      success: false,
      error: 'Seul le propriétaire de la boutique peut supprimer une réponse',
    };
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from('reviews')
    .update({ vendor_response: null, vendor_response_at: null })
    .eq('id', reviewId)
    .eq('vendor_id', session.session.vendor.id);

  if (error) {
    console.error('[vendor-reviews] delete response:', error.message);
    return { success: false, error: 'Impossible de supprimer la réponse' };
  }

  revalidatePath(VENDOR_ROUTES.avis);
  return { success: true };
}
