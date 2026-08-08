import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getVendorSession } from '@/actions/vendor-auth';
import { CANCEL_REASONS, CANCELLABLE_STATUSES, type OrderStatus } from '@/types/vendor';

const VALID_REASONS = CANCEL_REASONS.map((r) => r.value) as string[];

/**
 * Proxy vers l'Edge Function `cancel-order-by-restaurant`.
 *
 * ⚠️ Cette fonction est **owner-only** côté backend : un assistant reçoit 403,
 * même avec `can_manage_orders`. On filtre donc ici aussi, pour renvoyer un
 * message clair plutôt qu'une erreur brute.
 */
export async function POST(request: Request) {
  const session = await getVendorSession();
  if (!session.ok) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  if (!session.session.isOwner) {
    return NextResponse.json(
      { error: "Seul le propriétaire de la boutique peut annuler une commande" },
      { status: 403 }
    );
  }

  let body: { orderId?: string; reason?: string; details?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }

  const { orderId, reason, details } = body;

  if (!orderId || !reason || !VALID_REASONS.includes(reason)) {
    return NextResponse.json(
      { error: "Motif d'annulation invalide" },
      { status: 400 }
    );
  }

  // « Autre » impose une précision — même règle que l'app iOS.
  if (reason === 'other' && !details?.trim()) {
    return NextResponse.json(
      { error: 'Merci de préciser le motif' },
      { status: 400 }
    );
  }

  const supabase = await createServerClient();
  const { data: order } = await supabase
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .eq('vendor_id', session.session.vendor.id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
  }

  if (!CANCELLABLE_STATUSES.includes(order.status as OrderStatus)) {
    return NextResponse.json(
      { error: 'Cette commande est trop avancée pour être annulée' },
      { status: 400 }
    );
  }

  const {
    data: { session: authSession },
  } = await supabase.auth.getSession();

  if (!authSession?.access_token) {
    return NextResponse.json({ error: 'Session expirée' }, { status: 401 });
  }

  try {
    // ⚠️ snake_case ici, contrairement à assign-driver.
    const payload: Record<string, string> = { order_id: orderId, reason };
    if (details?.trim()) payload.details = details.trim();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/cancel-order-by-restaurant`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authSession.access_token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      return NextResponse.json(
        { error: result.error || "L'annulation a échoué" },
        { status: response.ok ? 400 : response.status }
      );
    }

    return NextResponse.json({
      success: true,
      orderNumber: result.order_number,
    });
  } catch (error) {
    console.error('[api/vendeur/cancel-order]', error);
    return NextResponse.json(
      { error: 'Erreur réseau. Réessayez.' },
      { status: 502 }
    );
  }
}
