'use server';

import { createServerClient } from '@/lib/supabase/server';
import { requestOtp, verifyOtp } from '@/actions/auth';
import type { AuthErrorType } from '@/types/auth';
import type { Vendor } from '@/types/models';
import {
  FULL_PERMISSIONS,
  normalizePermissions,
  type VendorSessionResult,
} from '@/types/vendor';

/**
 * Traduit les erreurs propres au parcours vendeur.
 * `simple-otp` renvoie 403 pour un numéro inconnu ou un assistant désactivé —
 * les messages génériques du parcours client ne conviennent pas ici.
 */
function parseVendorOtpError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('désactivé') || lower.includes('desactive')) {
    return "Votre compte assistant a été désactivé par l'administrateur de la boutique.";
  }
  if (
    lower.includes('non autorisé') ||
    lower.includes('non autorise') ||
    lower.includes('aucun compte') ||
    lower.includes('not found')
  ) {
    return "Ce numéro n'est pas enregistré comme vendeur.";
  }
  return message;
}

/**
 * Demande un code OTP pour l'Espace Vendeur (`app_type: 'vendor'`).
 * L'action reste `'login'` : il n'y a pas d'inscription vendeur en self-service,
 * le provisioning se fait côté backend.
 */
export async function requestVendorOtp(phone: string): Promise<{
  success: boolean;
  channel?: 'whatsapp' | 'sms';
  error?: string;
  errorType?: AuthErrorType;
}> {
  const result = await requestOtp(phone, 'login', undefined, 'vendor');

  if (!result.success && result.error) {
    return { ...result, error: parseVendorOtpError(result.error) };
  }
  return result;
}

/** Vérifie le code OTP vendeur. `app_type: 'vendor'` conserve le rattachement backend. */
export async function verifyVendorOtp(phone: string, code: string) {
  return verifyOtp(phone, code, 'vendor');
}

/**
 * Charge la session vendeur de l'utilisateur connecté.
 *
 * Séquence validée avec le backend :
 *   1. `users` → role, vendor_id
 *   2. assistant → `assistant_users` (permissions + is_active, que la RLS ignore)
 *      admin → `vendors` via `owner_id`, puis repli sur `users.vendor_id`
 *   3. `vendors`
 *
 * Ne lève jamais : renvoie un motif de refus pour que l'appelant affiche
 * l'écran adapté plutôt qu'un back-office vide et silencieux.
 */
export async function getVendorSession(): Promise<VendorSessionResult> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, reason: 'not_authenticated' };

  const { data: profile } = await supabase
    .from('users')
    .select('id, phone, full_name, role, vendor_id, is_active')
    .eq('id', user.id)
    .single();

  if (!profile) return { ok: false, reason: 'not_authenticated' };

  const role = profile.role as string;
  if (role !== 'vendor_admin' && role !== 'vendor_assistant') {
    return { ok: false, reason: 'not_a_vendor' };
  }

  // v1 : admin uniquement. Les assistants sont bloqués côté backend sur
  // l'annulation, les réglages boutique et les avis — on ne livre pas un
  // back-office à moitié fonctionnel.
  if (role === 'vendor_assistant') {
    const { data: assistant } = await supabase
      .from('assistant_users')
      .select('is_active')
      .eq('user_id', user.id)
      .maybeSingle();

    // La RLS ne filtre pas `is_active` : on le vérifie ici, comme l'app iOS.
    if (assistant?.is_active === false) {
      return { ok: false, reason: 'assistant_deactivated' };
    }
    return { ok: false, reason: 'assistant_not_supported' };
  }

  // Admin : `owner_id` d'abord (c'est ce que résout la RLS), repli sur
  // `users.vendor_id` pour les comptes dont l'owner n'a pas été positionné.
  const { data: ownedVendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle();

  let vendor = ownedVendor as Vendor | null;

  if (!vendor && profile.vendor_id) {
    const { data: linkedVendor } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', profile.vendor_id)
      .maybeSingle();
    vendor = linkedVendor as Vendor | null;
  }

  if (!vendor) return { ok: false, reason: 'no_vendor_linked' };

  return {
    ok: true,
    session: {
      userId: profile.id,
      fullName: profile.full_name,
      phone: profile.phone,
      role: 'vendor_admin',
      isOwner: vendor.owner_id === user.id,
      vendor,
      permissions: FULL_PERMISSIONS,
    },
  };
}

/**
 * Permissions effectives : un admin a tout, un assistant lit son JSONB
 * (complété — le DEFAULT en base est `'{}'`).
 */
export async function getEffectivePermissions(userId: string, role: string) {
  if (role === 'vendor_admin') return FULL_PERMISSIONS;

  const supabase = await createServerClient();
  const { data } = await supabase
    .from('assistant_users')
    .select('permissions')
    .eq('user_id', userId)
    .maybeSingle();

  return normalizePermissions(data?.permissions);
}
