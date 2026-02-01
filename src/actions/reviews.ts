'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase/server';
import type { Review, ReportReason } from '@/types/models';

/**
 * Get reviews for a vendor
 */
export async function getVendorReviews(
  vendorId: string,
  limit: number = 20
): Promise<Review[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      user:users(full_name)
    `)
    .eq('vendor_id', vendorId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching vendor reviews:', error);
    return [];
  }

  return data as Review[];
}

/**
 * Get user's reviews
 */
export async function getUserReviews(): Promise<Review[]> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      vendor:vendors(id, name, logo_url)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user reviews:', error);
    return [];
  }

  return data as Review[];
}

/**
 * Get orders that can be reviewed (delivered but not yet reviewed)
 */
export async function getReviewableOrders(): Promise<
  Array<{
    id: string;
    order_number: string;
    vendor_id: string;
    vendor: { id: string; name: string; logo_url: string | null };
    delivered_at: string;
  }>
> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Get delivered orders
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      vendor_id,
      vendor:vendors(id, name, logo_url),
      delivered_at
    `)
    .eq('user_id', user.id)
    .eq('status', 'delivered')
    .order('delivered_at', { ascending: false })
    .limit(10);

  if (ordersError || !orders) {
    console.error('Error fetching orders:', ordersError);
    return [];
  }

  // Get already reviewed orders
  const { data: existingReviews } = await supabase
    .from('reviews')
    .select('order_id')
    .eq('user_id', user.id)
    .not('order_id', 'is', null);

  const reviewedOrderIds = new Set(existingReviews?.map((r) => r.order_id) || []);

  // Filter out already reviewed orders and transform vendor
  return orders
    .filter((order) => !reviewedOrderIds.has(order.id))
    .map((order) => ({
      id: order.id,
      order_number: order.order_number,
      vendor_id: order.vendor_id,
      vendor: Array.isArray(order.vendor) ? order.vendor[0] : order.vendor,
      delivered_at: order.delivered_at,
    })) as Array<{
    id: string;
    order_number: string;
    vendor_id: string;
    vendor: { id: string; name: string; logo_url: string | null };
    delivered_at: string;
  }>;
}

/**
 * Create a new review
 */
export async function createReview(data: {
  orderId: string;
  vendorId: string;
  vendorRating: number;
  deliveryRating?: number;
  foodRating?: number;
  comment?: string;
  isAnonymous?: boolean;
}): Promise<{ success: boolean; review?: Review; error?: string }> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Non authentifié' };
  }

  // Validate rating
  if (data.vendorRating < 1 || data.vendorRating > 5) {
    return { success: false, error: 'Note invalide' };
  }

  // Check if order belongs to user and is delivered
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, status, user_id')
    .eq('id', data.orderId)
    .single();

  if (orderError || !order) {
    return { success: false, error: 'Commande non trouvée' };
  }

  if (order.user_id !== user.id) {
    return { success: false, error: 'Commande non autorisée' };
  }

  if (order.status !== 'delivered') {
    return { success: false, error: 'La commande doit être livrée pour laisser un avis' };
  }

  // Check if already reviewed
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('order_id', data.orderId)
    .eq('user_id', user.id)
    .single();

  if (existingReview) {
    return { success: false, error: 'Vous avez déjà laissé un avis pour cette commande' };
  }

  // Create review
  const { data: review, error: createError } = await supabase
    .from('reviews')
    .insert({
      user_id: user.id,
      order_id: data.orderId,
      vendor_id: data.vendorId,
      vendor_rating: data.vendorRating,
      delivery_rating: data.deliveryRating || null,
      food_rating: data.foodRating || null,
      comment: data.comment?.trim() || null,
      is_anonymous: data.isAnonymous || false,
      is_verified_purchase: true,
      status: 'approved', // Auto-approve for now
    })
    .select(`
      *,
      vendor:vendors(id, name, logo_url)
    `)
    .single();

  if (createError) {
    console.error('Error creating review:', createError);
    return { success: false, error: 'Erreur lors de la création de l\'avis' };
  }

  // Update vendor rating (simple average for now)
  await updateVendorRating(data.vendorId);

  revalidatePath(`/restaurants/${data.vendorId}`);
  revalidatePath(`/commerces/${data.vendorId}`);

  return { success: true, review: review as Review };
}

/**
 * Update a review
 */
export async function updateReview(
  reviewId: string,
  data: {
    vendorRating?: number;
    deliveryRating?: number;
    foodRating?: number;
    comment?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Non authentifié' };
  }

  // Verify ownership
  const { data: review, error: fetchError } = await supabase
    .from('reviews')
    .select('id, user_id, vendor_id')
    .eq('id', reviewId)
    .single();

  if (fetchError || !review) {
    return { success: false, error: 'Avis non trouvé' };
  }

  if (review.user_id !== user.id) {
    return { success: false, error: 'Non autorisé' };
  }

  const updateData: Record<string, unknown> = {};
  if (data.vendorRating !== undefined) updateData.vendor_rating = data.vendorRating;
  if (data.deliveryRating !== undefined) updateData.delivery_rating = data.deliveryRating;
  if (data.foodRating !== undefined) updateData.food_rating = data.foodRating;
  if (data.comment !== undefined) updateData.comment = data.comment.trim() || null;

  const { error: updateError } = await supabase
    .from('reviews')
    .update(updateData)
    .eq('id', reviewId);

  if (updateError) {
    console.error('Error updating review:', updateError);
    return { success: false, error: 'Erreur lors de la mise à jour' };
  }

  // Update vendor rating
  await updateVendorRating(review.vendor_id);

  return { success: true };
}

/**
 * Delete a review
 */
export async function deleteReview(
  reviewId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Non authentifié' };
  }

  // Verify ownership and get vendor_id
  const { data: review, error: fetchError } = await supabase
    .from('reviews')
    .select('id, user_id, vendor_id')
    .eq('id', reviewId)
    .single();

  if (fetchError || !review) {
    return { success: false, error: 'Avis non trouvé' };
  }

  if (review.user_id !== user.id) {
    return { success: false, error: 'Non autorisé' };
  }

  const { error: deleteError } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId);

  if (deleteError) {
    console.error('Error deleting review:', deleteError);
    return { success: false, error: 'Erreur lors de la suppression' };
  }

  // Update vendor rating
  await updateVendorRating(review.vendor_id);

  return { success: true };
}

/**
 * Report a review
 */
export async function reportReview(
  reviewId: string,
  reason: ReportReason,
  description?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Non authentifié' };
  }

  // Check if already reported by this user
  const { data: existingReport } = await supabase
    .from('review_reports')
    .select('id')
    .eq('review_id', reviewId)
    .eq('reported_by', user.id)
    .single();

  if (existingReport) {
    return { success: false, error: 'Vous avez déjà signalé cet avis' };
  }

  const { error: reportError } = await supabase.from('review_reports').insert({
    review_id: reviewId,
    reported_by: user.id,
    reason,
    description: description?.trim() || null,
  });

  if (reportError) {
    console.error('Error reporting review:', reportError);
    return { success: false, error: 'Erreur lors du signalement' };
  }

  // Increment report count on review
  await supabase.rpc('increment_review_report_count', { review_id: reviewId });

  return { success: true };
}

/**
 * Mark a review as helpful
 */
export async function markReviewHelpful(
  reviewId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient();

  const { error } = await supabase.rpc('increment_review_helpful_count', {
    review_id: reviewId,
  });

  if (error) {
    console.error('Error marking review helpful:', error);
    return { success: false, error: 'Erreur' };
  }

  return { success: true };
}

/**
 * Helper to update vendor's average rating
 */
async function updateVendorRating(vendorId: string): Promise<void> {
  const supabase = await createServerClient();

  const { data: reviews } = await supabase
    .from('reviews')
    .select('vendor_rating')
    .eq('vendor_id', vendorId)
    .eq('status', 'approved')
    .not('vendor_rating', 'is', null);

  if (!reviews || reviews.length === 0) {
    await supabase
      .from('vendors')
      .update({ rating: null, review_count: 0 })
      .eq('id', vendorId);
    return;
  }

  const avgRating =
    reviews.reduce((sum, r) => sum + (r.vendor_rating || 0), 0) / reviews.length;

  await supabase
    .from('vendors')
    .update({
      rating: Math.round(avgRating * 10) / 10,
      review_count: reviews.length,
    })
    .eq('id', vendorId);
}
