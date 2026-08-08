'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase/server';
import { getVendorSession } from '@/actions/vendor-auth';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import {
  normalizePermissions,
  type AssistantPermissions,
  type VendorAssistant,
} from '@/types/vendor';

export async function fetchVendorAssistants(): Promise<{
  assistants: VendorAssistant[];
  error?: string;
}> {
  const session = await getVendorSession();
  if (!session.ok) return { assistants: [], error: 'Session vendeur introuvable' };

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('assistant_users')
    .select('id, user_id, vendor_id, permissions, is_active, created_at, user:users(id, phone, full_name)')
    .eq('vendor_id', session.session.vendor.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[vendor-assistants] fetch:', error.message);
    return { assistants: [], error: 'Impossible de charger les assistants' };
  }

  const assistants = (data ?? []).map((row) => ({
    ...row,
    // Le DEFAULT en base est `'{}'` : toute clé absente vaut `false`.
    permissions: normalizePermissions(
      row.permissions as Partial<AssistantPermissions>
    ),
  })) as unknown as VendorAssistant[];

  return { assistants };
}

/** `771234567` ou `+221771234567` → `+221771234567`. */
function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('221')) return `+${digits}`;
  return `+221${digits}`;
}

/**
 * Création via l'Edge Function `create-assistant` : elle crée le compte
 * `auth.users` puis la ligne `assistant_users` via trigger.
 * Un INSERT direct donnerait un assistant incapable de se connecter.
 */
export async function createVendorAssistant(values: {
  name: string;
  phone: string;
  permissions: AssistantPermissions;
}): Promise<{ success: boolean; error?: string }> {
  const session = await getVendorSession();
  if (!session.ok) return { success: false, error: 'Session vendeur introuvable' };

  if (!session.session.isOwner) {
    return {
      success: false,
      error: 'Seul le propriétaire de la boutique peut créer un assistant',
    };
  }

  if (!values.name.trim()) return { success: false, error: 'Le nom est requis' };

  const digits = values.phone.replace(/\D/g, '');
  if (digits.replace(/^221/, '').length !== 9) {
    return { success: false, error: 'Le numéro de téléphone est requis' };
  }

  const supabase = await createServerClient();
  const {
    data: { session: authSession },
  } = await supabase.auth.getSession();

  if (!authSession?.access_token) {
    return { success: false, error: 'Session expirée. Veuillez vous reconnecter' };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-assistant`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authSession.access_token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({
          vendor_id: session.session.vendor.id,
          name: values.name.trim(),
          phone: toE164(values.phone),
          permissions: values.permissions,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      const raw = (result.error ?? '').toLowerCase();
      let message = 'Impossible de créer l\'assistant. Veuillez réessayer.';

      if (raw.includes('déjà utilisé') || raw.includes('deja utilise')) {
        message = 'Ce numéro de téléphone est déjà utilisé par un autre compte.';
      } else if (raw.includes('non autorisé') || raw.includes('non autorise')) {
        message = "Vous n'avez pas les permissions nécessaires.";
      } else if (raw.includes('téléphone invalide') || raw.includes('invalid')) {
        message = "Le numéro de téléphone n'est pas valide.";
      }

      return { success: false, error: message };
    }

    revalidatePath(VENDOR_ROUTES.assistants);
    return { success: true };
  } catch (error) {
    console.error('[vendor-assistants] create:', error);
    return { success: false, error: 'Problème de connexion. Vérifiez votre internet' };
  }
}

/** Les permissions vivent dans un JSONB : on réécrit l'objet complet. */
export async function updateAssistantPermissions(
  assistantId: string,
  permissions: AssistantPermissions
): Promise<{ success: boolean; error?: string }> {
  const session = await getVendorSession();
  if (!session.ok) return { success: false, error: 'Session vendeur introuvable' };

  if (!session.session.isOwner) {
    return {
      success: false,
      error: 'Seul le propriétaire de la boutique peut modifier les permissions',
    };
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from('assistant_users')
    .update({ permissions })
    .eq('id', assistantId)
    .eq('vendor_id', session.session.vendor.id);

  if (error) {
    console.error('[vendor-assistants] permissions:', error.message);
    return { success: false, error: 'Impossible de modifier les permissions' };
  }

  revalidatePath(VENDOR_ROUTES.assistants);
  return { success: true };
}

export async function toggleAssistantActive(
  assistantId: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  const session = await getVendorSession();
  if (!session.ok) return { success: false, error: 'Session vendeur introuvable' };

  if (!session.session.isOwner) {
    return {
      success: false,
      error: 'Seul le propriétaire de la boutique peut modifier un assistant',
    };
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from('assistant_users')
    .update({ is_active: isActive })
    .eq('id', assistantId)
    .eq('vendor_id', session.session.vendor.id);

  if (error) {
    console.error('[vendor-assistants] toggle:', error.message);
    return { success: false, error: 'Impossible de modifier le statut' };
  }

  revalidatePath(VENDOR_ROUTES.assistants);
  return { success: true };
}

/**
 * Suppression via l'Edge Function `delete-assistant` : elle nettoie
 * `assistant_users`, `public.users` **et** `auth.users`, ce qu'un DELETE
 * direct ne ferait pas (le numéro resterait bloqué).
 */
export async function deleteVendorAssistant(
  assistantId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getVendorSession();
  if (!session.ok) return { success: false, error: 'Session vendeur introuvable' };

  if (!session.session.isOwner) {
    return {
      success: false,
      error: 'Seul le propriétaire de la boutique peut supprimer un assistant',
    };
  }

  const supabase = await createServerClient();
  const {
    data: { session: authSession },
  } = await supabase.auth.getSession();

  if (!authSession?.access_token) {
    return { success: false, error: 'Session expirée. Veuillez vous reconnecter' };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/delete-assistant`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authSession.access_token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({ assistant_id: assistantId, type: 'vendor' }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        error: "Impossible de supprimer l'assistant. Veuillez réessayer.",
      };
    }

    revalidatePath(VENDOR_ROUTES.assistants);
    return { success: true };
  } catch (error) {
    console.error('[vendor-assistants] delete:', error);
    return { success: false, error: 'Problème de connexion. Vérifiez votre internet' };
  }
}
