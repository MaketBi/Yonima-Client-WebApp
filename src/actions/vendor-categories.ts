'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase/server';
import { getVendorSession } from '@/actions/vendor-auth';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';

/**
 * Ligne brute de `vendor_menu_categories`.
 *
 * ⚠️ Distincte de `VendorMenuCategory` (retour de la RPC), dont le champ `name`
 * est un `COALESCE(display_name, menu_categories.name)`. Pour préremplir un
 * formulaire d'édition il faut le **vrai** `display_name`, sinon on ne peut pas
 * distinguer un nom personnalisé du nom par défaut du type.
 */
export interface VendorCategoryRow {
  id: string;
  vendor_id: string;
  menu_category_id: string;
  display_name: string | null;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface CategoryFormValues {
  /** Type de catégorie (`menu_categories.id`) — immuable après création. */
  menuCategoryId: string;
  displayName: string | null;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number | null;
}

/** Message d'unicité `(vendor_id, menu_category_id, COALESCE(display_name,''))`. */
const DUPLICATE_MESSAGE =
  'Une catégorie identique existe déjà pour ce type. Donnez un nom personnalisé différent.';

function isDuplicateError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('duplicate') ||
    lower.includes('unique') ||
    lower.includes('23505')
  );
}

/**
 * Le CRUD des catégories est **réservé au propriétaire** (policy RLS
 * `vendor_menu_categories`, décision produit du 2026-05-06). Un assistant peut
 * affecter un produit à une catégorie, mais pas en créer.
 */
async function requireOwner() {
  const session = await getVendorSession();
  if (!session.ok) {
    return { ok: false as const, error: 'Session vendeur introuvable' };
  }
  if (!session.session.isOwner) {
    return {
      ok: false as const,
      error: 'Seul le propriétaire de la boutique peut gérer les catégories',
    };
  }
  return { ok: true as const, session: session.session };
}

/** Lignes brutes, pour le formulaire d'édition. */
export async function fetchVendorCategoryRows(): Promise<VendorCategoryRow[]> {
  const session = await getVendorSession();
  if (!session.ok) return [];

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('vendor_menu_categories')
    .select(
      'id, vendor_id, menu_category_id, display_name, description, image_url, sort_order, is_active'
    )
    .eq('vendor_id', session.session.vendor.id)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[vendor-categories] fetch rows:', error.message);
    return [];
  }

  return (data ?? []) as VendorCategoryRow[];
}

export async function createVendorCategory(
  form: CategoryFormValues
): Promise<{ success: boolean; error?: string }> {
  const guard = await requireOwner();
  if (!guard.ok) return { success: false, error: guard.error };

  if (!form.menuCategoryId) {
    return { success: false, error: 'Veuillez choisir un type de catégorie' };
  }

  const supabase = await createServerClient();

  // Position par défaut : à la fin (max + 1), comme l'app iOS.
  let sortOrder = form.sortOrder;
  if (sortOrder === null) {
    const { data } = await supabase
      .from('vendor_menu_categories')
      .select('sort_order')
      .eq('vendor_id', guard.session.vendor.id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    sortOrder = ((data?.sort_order as number | undefined) ?? 0) + 1;
  }

  const { error } = await supabase.from('vendor_menu_categories').insert({
    vendor_id: guard.session.vendor.id,
    menu_category_id: form.menuCategoryId,
    display_name: form.displayName?.trim() || null,
    description: form.description?.trim() || null,
    image_url: form.imageUrl,
    sort_order: sortOrder,
    is_active: true,
  });

  if (error) {
    console.error('[vendor-categories] create:', error.message);
    return {
      success: false,
      error: isDuplicateError(error.message)
        ? DUPLICATE_MESSAGE
        : 'Impossible de créer la catégorie',
    };
  }

  revalidatePath(VENDOR_ROUTES.produits);
  revalidatePath(VENDOR_ROUTES.categories);
  return { success: true };
}

export async function updateVendorCategory(
  categoryId: string,
  form: CategoryFormValues
): Promise<{ success: boolean; error?: string }> {
  const guard = await requireOwner();
  if (!guard.ok) return { success: false, error: guard.error };

  const supabase = await createServerClient();

  // ⚠️ `menu_category_id` est volontairement absent : le type est immuable
  // après création (« Pour changer, supprimez puis recréez »).
  const { error } = await supabase
    .from('vendor_menu_categories')
    .update({
      display_name: form.displayName?.trim() || null,
      description: form.description?.trim() || null,
      image_url: form.imageUrl,
      sort_order: form.sortOrder ?? 0,
    })
    .eq('id', categoryId)
    .eq('vendor_id', guard.session.vendor.id);

  if (error) {
    console.error('[vendor-categories] update:', error.message);
    return {
      success: false,
      error: isDuplicateError(error.message)
        ? DUPLICATE_MESSAGE
        : 'Impossible de modifier la catégorie',
    };
  }

  revalidatePath(VENDOR_ROUTES.produits);
  revalidatePath(VENDOR_ROUTES.categories);
  return { success: true };
}

/**
 * Suppression définitive. Les produits rattachés ne sont pas supprimés :
 * la FK est `ON DELETE SET NULL`, ils basculent en « Sans catégorie ».
 */
export async function deleteVendorCategory(
  categoryId: string
): Promise<{ success: boolean; error?: string }> {
  const guard = await requireOwner();
  if (!guard.ok) return { success: false, error: guard.error };

  const supabase = await createServerClient();
  const { error } = await supabase
    .from('vendor_menu_categories')
    .delete()
    .eq('id', categoryId)
    .eq('vendor_id', guard.session.vendor.id);

  if (error) {
    console.error('[vendor-categories] delete:', error.message);
    return { success: false, error: 'Impossible de supprimer la catégorie' };
  }

  revalidatePath(VENDOR_ROUTES.produits);
  revalidatePath(VENDOR_ROUTES.categories);
  return { success: true };
}
