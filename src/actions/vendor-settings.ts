'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase/server';
import { getVendorSession } from '@/actions/vendor-auth';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import type { DeliveryMode, OpeningHours } from '@/types/vendor';

const PREP_TIME_MAX = 240;

/**
 * Sauvegarde les horaires (JSONB `vendors.opening_hours`).
 * Un jour à `null` = fermé. Format `"HH:mm"` strict.
 *
 * ⚠️ Réservé au propriétaire : la policy `vendors_update_owner` n'autorise que
 * `owner_id = auth.uid()`, et il n'existe aucune Edge Function `update-vendor`.
 */
export async function updateOpeningHours(
  hours: OpeningHours
): Promise<{ success: boolean; error?: string }> {
  const session = await getVendorSession();
  if (!session.ok) return { success: false, error: 'Session vendeur introuvable' };

  if (!session.session.isOwner) {
    return {
      success: false,
      error: 'Seul le propriétaire de la boutique peut modifier les horaires',
    };
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from('vendors')
    .update({ opening_hours: hours })
    .eq('id', session.session.vendor.id);

  if (error) {
    console.error('[vendor-settings] hours:', error.message);
    return { success: false, error: 'Une erreur est survenue. Veuillez réessayer' };
  }

  revalidatePath(VENDOR_ROUTES.horaires);
  return { success: true };
}

/** Kill-switch : ferme immédiatement la boutique, quels que soient les horaires. */
export async function toggleVendorOpen(
  isOpen: boolean
): Promise<{ success: boolean; error?: string }> {
  const session = await getVendorSession();
  if (!session.ok) return { success: false, error: 'Session vendeur introuvable' };

  if (!session.session.isOwner) {
    return {
      success: false,
      error: 'Seul le propriétaire de la boutique peut ouvrir ou fermer',
    };
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from('vendors')
    .update({ is_open: isOpen })
    .eq('id', session.session.vendor.id);

  if (error) {
    console.error('[vendor-settings] is_open:', error.message);
    return { success: false, error: 'Impossible de mettre à jour le statut' };
  }

  revalidatePath(VENDOR_ROUTES.horaires);
  return { success: true };
}

/**
 * Paramètres de livraison.
 *
 * ⚠️ **`delivery_fee` et `estimated_time` ne doivent jamais être envoyés**
 * (legacy depuis « PR8 backend ») : le prix client vient d'une matrice
 * tier→tier et l'ETA dérive de `prep_time_minutes` + distance.
 */
export async function updateDeliverySettings(values: {
  prepTimeMinutes: number;
  minOrder: number;
}): Promise<{ success: boolean; error?: string }> {
  const session = await getVendorSession();
  if (!session.ok) return { success: false, error: 'Session vendeur introuvable' };

  if (!session.session.isOwner) {
    return {
      success: false,
      error: 'Seul le propriétaire de la boutique peut modifier ces paramètres',
    };
  }

  const prepTime = Math.round(values.prepTimeMinutes);
  if (!Number.isFinite(prepTime) || prepTime < 0 || prepTime > PREP_TIME_MAX) {
    return {
      success: false,
      error: 'Le temps de préparation doit être compris entre 0 et 240 minutes',
    };
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from('vendors')
    .update({
      prep_time_minutes: prepTime,
      min_order: Math.max(0, Math.round(values.minOrder) || 0),
    })
    .eq('id', session.session.vendor.id);

  if (error) {
    console.error('[vendor-settings] delivery:', error.message);
    return { success: false, error: 'Erreur lors de la mise à jour des paramètres' };
  }

  revalidatePath(VENDOR_ROUTES.parametresLivraison);
  return { success: true };
}

/** Bascule `internal_only` ↔ `pool_only`. Owner-only (gate plus strict qu'admin). */
export async function updateDeliveryMode(
  mode: DeliveryMode
): Promise<{ success: boolean; error?: string }> {
  const session = await getVendorSession();
  if (!session.ok) return { success: false, error: 'Session vendeur introuvable' };

  if (!session.session.isOwner) {
    return {
      success: false,
      error: 'Seul le propriétaire de la boutique peut changer le mode de livraison',
    };
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from('vendors')
    .update({ delivery_mode: mode })
    .eq('id', session.session.vendor.id);

  if (error) {
    console.error('[vendor-settings] mode:', error.message);
    return { success: false, error: 'Impossible de modifier le mode. Réessayez' };
  }

  revalidatePath(VENDOR_ROUTES.parametresLivraison);
  return { success: true };
}

/** Nombre de livreurs actifs — conditionne l'avertissement du changement de mode. */
export async function countActiveDrivers(): Promise<number> {
  const session = await getVendorSession();
  if (!session.ok) return 0;

  const supabase = await createServerClient();
  const { count } = await supabase
    .from('drivers')
    .select('id', { count: 'exact', head: true })
    .eq('vendor_id', session.session.vendor.id)
    .eq('is_active', true);

  return count ?? 0;
}

/**
 * Profil de la boutique.
 *
 * ⚠️ Contrairement à l'app iOS, les champs vidés sont bien mis à `null` :
 * côté mobile ils sont omis du payload, donc impossibles à effacer.
 * Le téléphone n'est pas modifiable (il identifie le compte).
 */
export async function updateVendorProfile(values: {
  name: string;
  description: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  neighborhood: string | null;
  logoUrl: string | null;
}): Promise<{ success: boolean; error?: string }> {
  const session = await getVendorSession();
  if (!session.ok) return { success: false, error: 'Session vendeur introuvable' };

  if (!session.session.isOwner) {
    return {
      success: false,
      error: 'Seul le propriétaire de la boutique peut modifier le profil',
    };
  }

  if (!values.name.trim()) {
    return { success: false, error: "Le nom de l'établissement est requis" };
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from('vendors')
    .update({
      name: values.name.trim(),
      description: values.description?.trim() || null,
      email: values.email?.trim() || null,
      address: values.address?.trim() || null,
      city: values.city?.trim() || null,
      neighborhood: values.neighborhood?.trim() || null,
      logo_url: values.logoUrl,
    })
    .eq('id', session.session.vendor.id);

  if (error) {
    console.error('[vendor-settings] profile:', error.message);
    return { success: false, error: 'Impossible de mettre à jour le profil' };
  }

  revalidatePath(VENDOR_ROUTES.profil);
  return { success: true };
}
