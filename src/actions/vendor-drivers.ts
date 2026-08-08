'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase/server';
import { getVendorSession } from '@/actions/vendor-auth';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import {
  DRIVER_PHONE_REGEX,
  type VehicleType,
  type VendorDriver,
} from '@/types/vendor';

export interface DriverFormValues {
  name: string;
  /** Saisi en local (9 chiffres) ou en E.164. */
  phone: string;
  vehicleType: VehicleType;
}

function validate(form: DriverFormValues): string | null {
  if (!form.name.trim()) return 'Le nom est obligatoire';

  const phone = form.phone.replace(/\s/g, '');
  if (!phone) return 'Le téléphone est obligatoire';
  if (!DRIVER_PHONE_REGEX.test(phone)) {
    return "Le numéro de téléphone n'est pas valide. Format : 7X XXX XX XX";
  }
  return null;
}

/** Traduit les erreurs Postgres/Edge en messages lisibles (mapping iOS). */
function parseDriverError(message: string, fallback: string): string {
  const lower = message.toLowerCase();

  const isDuplicate =
    lower.includes('duplicate') ||
    lower.includes('unique') ||
    lower.includes('23505') ||
    lower.includes('already') ||
    lower.includes('exists');

  if (lower.includes('phone') && isDuplicate) {
    return "Ce numéro de téléphone est déjà utilisé par un autre livreur";
  }
  if (isDuplicate) return 'Ce livreur existe déjà';
  if (lower.includes('unauthorized') || lower.includes('401')) {
    return 'Session expirée. Veuillez vous reconnecter';
  }
  if (lower.includes('invalid') || lower.includes('validation')) {
    return 'Données invalides. Vérifiez les informations saisies';
  }
  return fallback;
}

export async function fetchVendorDrivers(): Promise<{
  drivers: VendorDriver[];
  error?: string;
}> {
  const session = await getVendorSession();
  if (!session.ok) return { drivers: [], error: 'Session vendeur introuvable' };

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('drivers')
    .select(
      'id, user_id, vendor_id, name, phone, avatar_url, vehicle_type, license_plate, is_online, is_active, is_platform_driver, status, current_order_id'
    )
    .eq('vendor_id', session.session.vendor.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[vendor-drivers] fetch:', error.message);
    return { drivers: [], error: 'Impossible de charger les livreurs' };
  }

  return { drivers: (data ?? []) as VendorDriver[] };
}

/**
 * Création via l'Edge Function `create-driver` : elle crée aussi le compte
 * `auth.users` du livreur. Un INSERT direct produirait un livreur incapable
 * de se connecter.
 *
 * ⚠️ Cette fonction est owner-only côté backend (bug connu : elle lit une
 * colonne JSONB comme une colonne plate pour les assistants). On filtre donc ici.
 */
export async function createVendorDriver(
  form: DriverFormValues
): Promise<{ success: boolean; error?: string }> {
  const session = await getVendorSession();
  if (!session.ok) return { success: false, error: 'Session vendeur introuvable' };

  if (!session.session.isOwner) {
    return {
      success: false,
      error: 'Seul le propriétaire de la boutique peut ajouter un livreur',
    };
  }

  const invalid = validate(form);
  if (invalid) return { success: false, error: invalid };

  const supabase = await createServerClient();
  const {
    data: { session: authSession },
  } = await supabase.auth.getSession();

  if (!authSession?.access_token) {
    return { success: false, error: 'Session expirée' };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-driver`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authSession.access_token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          // L'Edge Function attend les chiffres seuls.
          phone: form.phone.replace(/\D/g, ''),
          vendor_id: session.session.vendor.id,
          vehicle_type: form.vehicleType,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        error: parseDriverError(
          result.error ?? '',
          "Impossible d'ajouter le livreur"
        ),
      };
    }

    revalidatePath(VENDOR_ROUTES.livreurs);
    return { success: true };
  } catch (error) {
    console.error('[vendor-drivers] create:', error);
    return { success: false, error: 'Problème de connexion. Vérifiez votre internet' };
  }
}

export async function updateVendorDriver(
  driverId: string,
  form: DriverFormValues
): Promise<{ success: boolean; error?: string }> {
  const session = await getVendorSession();
  if (!session.ok) return { success: false, error: 'Session vendeur introuvable' };

  if (!session.session.permissions.can_view_drivers) {
    return { success: false, error: "Vous n'avez pas la permission de gérer les livreurs" };
  }

  const invalid = validate(form);
  if (invalid) return { success: false, error: invalid };

  const supabase = await createServerClient();
  const { error } = await supabase
    .from('drivers')
    .update({
      name: form.name.trim(),
      phone: form.phone.replace(/\s/g, ''),
      vehicle_type: form.vehicleType,
      updated_at: new Date().toISOString(),
    })
    .eq('id', driverId)
    .eq('vendor_id', session.session.vendor.id);

  if (error) {
    console.error('[vendor-drivers] update:', error.message);
    return {
      success: false,
      error: parseDriverError(error.message, 'Impossible de modifier le livreur'),
    };
  }

  revalidatePath(VENDOR_ROUTES.livreurs);
  return { success: true };
}

/** Désactiver force `status = 'offline'` pour retirer le livreur du dispatch. */
export async function toggleDriverActive(
  driverId: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  const session = await getVendorSession();
  if (!session.ok) return { success: false, error: 'Session vendeur introuvable' };

  if (!session.session.permissions.can_view_drivers) {
    return { success: false, error: "Vous n'avez pas la permission de gérer les livreurs" };
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from('drivers')
    .update({
      is_active: isActive,
      status: isActive ? null : 'offline',
      updated_at: new Date().toISOString(),
    })
    .eq('id', driverId)
    .eq('vendor_id', session.session.vendor.id);

  if (error) {
    console.error('[vendor-drivers] toggle:', error.message);
    return { success: false, error: 'Impossible de modifier le statut' };
  }

  revalidatePath(VENDOR_ROUTES.livreurs);
  return { success: true };
}

export async function deleteVendorDriver(
  driverId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getVendorSession();
  if (!session.ok) return { success: false, error: 'Session vendeur introuvable' };

  if (!session.session.isOwner) {
    return {
      success: false,
      error: 'Seul le propriétaire de la boutique peut supprimer un livreur',
    };
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from('drivers')
    .delete()
    .eq('id', driverId)
    .eq('vendor_id', session.session.vendor.id);

  if (error) {
    console.error('[vendor-drivers] delete:', error.message);
    return { success: false, error: 'Impossible de supprimer le livreur' };
  }

  revalidatePath(VENDOR_ROUTES.livreurs);
  return { success: true };
}
