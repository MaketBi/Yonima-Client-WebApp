import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getVendorSession } from '@/actions/vendor-auth';

/**
 * Proxy vers l'Edge Function `assign-driver`.
 *
 * Pourquoi passer par le serveur : `assign-driver` utilise `getCorsHeaders(origin)`
 * et n'autorisait pas `poulzz.store` — un appel direct depuis le navigateur était
 * bloqué. En relayant côté serveur, il n'y a pas de préflight CORS du tout.
 *
 * On relaie le JWT de l'utilisateur : **aucune service_role ici**, c'est la
 * fonction qui vérifie que l'appelant a le droit d'assigner.
 */
export async function POST(request: Request) {
  const session = await getVendorSession();
  if (!session.ok) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  if (!session.session.permissions.can_assign_drivers) {
    return NextResponse.json(
      { error: "Vous n'avez pas la permission d'assigner un livreur" },
      { status: 403 }
    );
  }

  let body: { orderId?: string; driverId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }

  const { orderId, driverId } = body;
  if (!orderId || !driverId) {
    return NextResponse.json(
      { error: 'orderId et driverId sont requis' },
      { status: 400 }
    );
  }

  // La commande doit appartenir au vendeur connecté — on ne délègue pas
  // ce contrôle à l'Edge Function.
  const supabase = await createServerClient();
  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('id', orderId)
    .eq('vendor_id', session.session.vendor.id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
  }

  const {
    data: { session: authSession },
  } = await supabase.auth.getSession();

  if (!authSession?.access_token) {
    return NextResponse.json({ error: 'Session expirée' }, { status: 401 });
  }

  try {
    // ⚠️ camelCase : c'est le contrat de cette fonction (cancel-order en snake_case).
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/assign-driver`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authSession.access_token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({ orderId, driverId }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      return NextResponse.json(
        { error: result.error || "L'assignation a échoué" },
        { status: response.ok ? 400 : response.status }
      );
    }

    return NextResponse.json({
      success: true,
      driverName: result.driverName,
      orderNumber: result.orderNumber,
    });
  } catch (error) {
    console.error('[api/vendeur/assign-driver]', error);
    return NextResponse.json(
      { error: 'Erreur réseau. Réessayez.' },
      { status: 502 }
    );
  }
}
