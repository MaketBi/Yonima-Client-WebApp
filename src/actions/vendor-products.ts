'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase/server';
import { getVendorSession } from '@/actions/vendor-auth';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import type {
  MenuCategoryRef,
  VendorMenuCategory,
  VendorProduct,
  VendorProductInput,
} from '@/types/vendor';

/** Catalogue du vendeur connecté. La RLS filtre déjà sur le vendor. */
export async function fetchVendorProducts(): Promise<{
  products: VendorProduct[];
  error?: string;
}> {
  const session = await getVendorSession();
  if (!session.ok) return { products: [], error: 'Session vendeur introuvable' };

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('products')
    .select(
      'id, vendor_id, name, description, price, vendor_net_price, unit, image_url, stock_quantity, is_available, is_active, is_published, vendor_menu_category_id, created_at'
    )
    .eq('vendor_id', session.session.vendor.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[vendor-products] fetch:', error.message);
    return { products: [], error: 'Impossible de charger le catalogue' };
  }

  return { products: (data ?? []) as VendorProduct[] };
}

/**
 * Catégories du vendeur.
 *
 * Passage obligé par la RPC : elle résout `name` côté serveur
 * (`COALESCE(display_name, menu_categories.name)`) et expose `kind`.
 */
export async function fetchVendorCategories(): Promise<{
  categories: VendorMenuCategory[];
  error?: string;
}> {
  const session = await getVendorSession();
  if (!session.ok) return { categories: [], error: 'Session vendeur introuvable' };

  const supabase = await createServerClient();
  const { data, error } = await supabase.rpc('get_vendor_menu_categories', {
    p_vendor_id: session.session.vendor.id,
  });

  if (error) {
    console.error('[vendor-products] categories:', error.message);
    return { categories: [], error: 'Impossible de charger les catégories' };
  }

  return { categories: (data ?? []) as VendorMenuCategory[] };
}

/** Référentiel global des « kinds » — nécessaire pour créer une catégorie. */
export async function fetchMenuCategoryRefs(): Promise<MenuCategoryRef[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('menu_categories')
    .select('id, kind, name, icon_url, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  return (data ?? []) as MenuCategoryRef[];
}

/**
 * Aperçu du prix de vente client à partir du net saisi.
 *
 * Pur confort : en cas d'échec on renvoie `null` et l'interface masque
 * simplement l'encart — jamais d'erreur bloquante pendant la saisie.
 */
export async function previewSalePrice(
  netPrice: number
): Promise<{ salePrice: number | null }> {
  const session = await getVendorSession();
  if (!session.ok || netPrice <= 0) return { salePrice: null };

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .rpc('rpc_vendor_sale_price_preview', {
      p_net: netPrice,
      p_vendor_id: session.session.vendor.id,
    })
    .single();

  if (error || !data) return { salePrice: null };

  const salePrice = (data as { sale_price?: number }).sale_price;
  return { salePrice: typeof salePrice === 'number' ? salePrice : null };
}

/**
 * Construit le payload d'écriture.
 *
 * ⚠️ **`price` n'est jamais envoyé** : le trigger `trg_products_derive_price_from_net`
 * le calcule à partir de `vendor_net_price`. L'envoyer donnerait l'illusion que
 * le vendeur fixe le prix client.
 */
function buildProductInput(
  vendorId: string,
  form: {
    name: string;
    description: string | null;
    netPrice: number;
    unit: string | null;
    stockQuantity: number | null;
    isAvailable: boolean;
    imageUrl: string | null;
    categoryId: string | null;
  }
): VendorProductInput {
  return {
    vendor_id: vendorId,
    name: form.name.trim(),
    description: form.description?.trim() || null,
    vendor_net_price: form.netPrice,
    unit: form.unit,
    image_url: form.imageUrl,
    stock_quantity: form.stockQuantity,
    is_available: form.isAvailable,
    // Non éditables depuis le back-office, toujours vrais (comme iOS).
    is_active: true,
    is_published: true,
    vendor_menu_category_id: form.categoryId,
  };
}

export interface ProductFormValues {
  name: string;
  description: string | null;
  netPrice: number;
  unit: string | null;
  stockQuantity: number | null;
  isAvailable: boolean;
  imageUrl: string | null;
  categoryId: string | null;
}

function validate(form: ProductFormValues): string | null {
  if (!form.name.trim()) return 'Le nom du produit est requis';
  if (!Number.isFinite(form.netPrice) || form.netPrice <= 0) {
    return 'Le prix que vous touchez doit être supérieur à 0';
  }
  if (!form.categoryId) return 'Veuillez sélectionner une catégorie';
  return null;
}

export async function createVendorProduct(
  form: ProductFormValues
): Promise<{ success: boolean; error?: string }> {
  const session = await getVendorSession();
  if (!session.ok) return { success: false, error: 'Session vendeur introuvable' };

  if (!session.session.permissions.can_manage_products) {
    return { success: false, error: "Vous n'avez pas la permission de gérer les produits" };
  }

  const invalid = validate(form);
  if (invalid) return { success: false, error: invalid };

  const supabase = await createServerClient();
  const { error } = await supabase
    .from('products')
    .insert(buildProductInput(session.session.vendor.id, form));

  if (error) {
    console.error('[vendor-products] create:', error.message);
    return { success: false, error: "La création du produit a échoué" };
  }

  revalidatePath(VENDOR_ROUTES.produits);
  return { success: true };
}

export async function updateVendorProduct(
  productId: string,
  form: ProductFormValues
): Promise<{ success: boolean; error?: string }> {
  const session = await getVendorSession();
  if (!session.ok) return { success: false, error: 'Session vendeur introuvable' };

  if (!session.session.permissions.can_manage_products) {
    return { success: false, error: "Vous n'avez pas la permission de gérer les produits" };
  }

  const invalid = validate(form);
  if (invalid) return { success: false, error: invalid };

  const supabase = await createServerClient();
  const { error } = await supabase
    .from('products')
    .update(buildProductInput(session.session.vendor.id, form))
    .eq('id', productId)
    .eq('vendor_id', session.session.vendor.id);

  if (error) {
    console.error('[vendor-products] update:', error.message);
    return { success: false, error: 'La mise à jour a échoué' };
  }

  revalidatePath(VENDOR_ROUTES.produits);
  return { success: true };
}

/** Bascule « Masquer » / « Afficher » (`is_available`). */
export async function toggleProductAvailability(
  productId: string,
  isAvailable: boolean
): Promise<{ success: boolean; error?: string }> {
  const session = await getVendorSession();
  if (!session.ok) return { success: false, error: 'Session vendeur introuvable' };

  if (!session.session.permissions.can_manage_products) {
    return { success: false, error: "Vous n'avez pas la permission de gérer les produits" };
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from('products')
    .update({ is_available: isAvailable })
    .eq('id', productId)
    .eq('vendor_id', session.session.vendor.id);

  if (error) {
    console.error('[vendor-products] toggle:', error.message);
    return { success: false, error: 'La mise à jour a échoué' };
  }

  revalidatePath(VENDOR_ROUTES.produits);
  return { success: true };
}

/** Suppression définitive (hard delete, comme l'app iOS). */
export async function deleteVendorProduct(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getVendorSession();
  if (!session.ok) return { success: false, error: 'Session vendeur introuvable' };

  if (!session.session.permissions.can_manage_products) {
    return { success: false, error: "Vous n'avez pas la permission de gérer les produits" };
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('vendor_id', session.session.vendor.id);

  if (error) {
    console.error('[vendor-products] delete:', error.message);
    return { success: false, error: 'La suppression a échoué' };
  }

  revalidatePath(VENDOR_ROUTES.produits);
  return { success: true };
}

/** Un produit précis, pour préremplir le formulaire d'édition. */
export async function fetchVendorProduct(
  productId: string
): Promise<{ product: VendorProduct | null }> {
  const session = await getVendorSession();
  if (!session.ok) return { product: null };

  const supabase = await createServerClient();
  const { data } = await supabase
    .from('products')
    .select(
      'id, vendor_id, name, description, price, vendor_net_price, unit, image_url, stock_quantity, is_available, is_active, is_published, vendor_menu_category_id, created_at'
    )
    .eq('id', productId)
    .eq('vendor_id', session.session.vendor.id)
    .maybeSingle();

  return { product: (data as VendorProduct) ?? null };
}
