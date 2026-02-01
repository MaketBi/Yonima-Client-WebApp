'use server';

import { createServerClient } from '@/lib/supabase/server';
import type { Vendor, Product, Category, VendorCategory, Pack, VendorType } from '@/types/models';

/**
 * Get vendors by type with optional filters
 */
export async function getVendorsByType(
  type: VendorType,
  options?: {
    limit?: number;
    offset?: number;
    featured?: boolean;
    search?: string;
  }
): Promise<Vendor[]> {
  try {
    const supabase = await createServerClient();
    let query = supabase
      .from('vendors')
      .select('*')
      .eq('type', type)
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('rating', { ascending: false, nullsFirst: false });

    if (options?.featured) {
      query = query.eq('is_featured', true);
    }

    if (options?.search) {
      query = query.ilike('name', `%${options.search}%`);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching vendors:', error);
      return [];
    }

    return data as Vendor[];
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return [];
  }
}

/**
 * Get a single vendor by slug or ID
 */
export async function getVendor(slugOrId: string): Promise<Vendor | null> {
  try {
    const supabase = await createServerClient();

    // Try to find by slug first, then by ID
    let { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('slug', slugOrId)
      .single();

    if (error || !data) {
      // Try by ID
      const result = await supabase
        .from('vendors')
        .select('*')
        .eq('id', slugOrId)
        .single();

      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error fetching vendor:', error);
      return null;
    }

    return data as Vendor;
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return null;
  }
}

/**
 * Get categories for a vendor from vendor_categories table
 */
export async function getVendorCategories(vendorId: string): Promise<VendorCategory[]> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('vendor_categories')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching vendor categories:', error);
      return [];
    }

    return data as VendorCategory[];
  } catch (error) {
    console.error('Error fetching vendor categories:', error);
    return [];
  }
}

/**
 * Get products for a vendor
 */
export async function getVendorProducts(
  vendorId: string,
  options?: {
    categoryId?: string;
    limit?: number;
    search?: string;
  }
): Promise<Product[]> {
  try {
    const supabase = await createServerClient();
    let query = supabase
      .from('products')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('is_active', true)
      .eq('is_published', true)
      .order('popularity_score', { ascending: false });

    if (options?.categoryId) {
      query = query.eq('vendor_category_id', options.categoryId);
    }

    if (options?.search) {
      query = query.ilike('name', `%${options.search}%`);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return data as Product[];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

/**
 * Get a single product by ID
 */
export async function getProduct(productId: string): Promise<Product | null> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, vendor:vendors(id, name, logo_url, delivery_fee, min_order)')
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    return data as Product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

/**
 * Get packs for a vendor
 */
export async function getVendorPacks(vendorId: string): Promise<Pack[]> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('packs')
      .select('*, pack_items(*)')
      .eq('vendor_id', vendorId)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching packs:', error);
      return [];
    }

    return data as Pack[];
  } catch (error) {
    console.error('Error fetching packs:', error);
    return [];
  }
}

/**
 * Get a single pack by ID
 */
export async function getPack(packId: string): Promise<Pack | null> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('packs')
      .select('*, pack_items(*), vendor:vendors(id, name, logo_url, delivery_fee, min_order)')
      .eq('id', packId)
      .single();

    if (error) {
      console.error('Error fetching pack:', error);
      return null;
    }

    return data as Pack;
  } catch (error) {
    console.error('Error fetching pack:', error);
    return null;
  }
}

/**
 * Get featured vendors across all types
 */
export async function getFeaturedVendors(limit?: number): Promise<Vendor[]> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('rating', { ascending: false, nullsFirst: false })
      .limit(limit || 6);

    if (error) {
      console.error('Error fetching featured vendors:', error);
      return [];
    }

    return data as Vendor[];
  } catch (error) {
    console.error('Error fetching featured vendors:', error);
    return [];
  }
}

/**
 * Get featured packs (most popular)
 */
export async function getFeaturedPacks(limit?: number): Promise<Pack[]> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('packs')
      .select('*, vendor:vendors(id, name, logo_url)')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(limit || 6);

    if (error) {
      console.error('Error fetching featured packs:', error);
      return [];
    }

    return data as Pack[];
  } catch (error) {
    console.error('Error fetching featured packs:', error);
    return [];
  }
}

/**
 * Search across vendors and products
 */
export async function searchCatalog(
  query: string,
  options?: { type?: VendorType; limit?: number }
): Promise<{ vendors: Vendor[]; products: Product[] }> {
  try {
    const supabase = await createServerClient();

    // Search vendors
    let vendorQuery = supabase
      .from('vendors')
      .select('*')
      .eq('is_active', true)
      .ilike('name', `%${query}%`)
      .limit(options?.limit || 10);

    if (options?.type) {
      vendorQuery = vendorQuery.eq('type', options.type);
    }

    // Search products
    const productQuery = supabase
      .from('products')
      .select('*, vendor:vendors(id, name, type)')
      .eq('is_active', true)
      .eq('is_published', true)
      .ilike('name', `%${query}%`)
      .limit(options?.limit || 10);

    const [vendorsResult, productsResult] = await Promise.all([
      vendorQuery,
      productQuery,
    ]);

    return {
      vendors: (vendorsResult.data as Vendor[]) || [],
      products: (productsResult.data as Product[]) || [],
    };
  } catch (error) {
    console.error('Error searching catalog:', error);
    return { vendors: [], products: [] };
  }
}

/**
 * Get the single grocery vendor (Épicerie Yonima)
 */
export async function getGroceryVendor(): Promise<Vendor | null> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('type', 'grocery')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching grocery vendor:', error);
      return null;
    }

    return data as Vendor;
  } catch (error) {
    console.error('Error fetching grocery vendor:', error);
    return null;
  }
}

/**
 * Get grocery categories (for epicerie page) from vendor_categories table
 */
export async function getGroceryCategories(): Promise<{ categories: VendorCategory[]; vendorId: string | null }> {
  try {
    const supabase = await createServerClient();

    // Get the grocery vendor
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('type', 'grocery')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (!vendor) {
      return { categories: [], vendorId: null };
    }

    const { data, error } = await supabase
      .from('vendor_categories')
      .select('*')
      .eq('vendor_id', vendor.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching grocery categories:', error);
      return { categories: [], vendorId: vendor.id };
    }

    return { categories: data as VendorCategory[], vendorId: vendor.id };
  } catch (error) {
    console.error('Error fetching grocery categories:', error);
    return { categories: [], vendorId: null };
  }
}

/**
 * Get products by vendor_category_id
 */
export async function getGroceryProductsByCategory(
  categoryId: string,
  options?: { limit?: number; offset?: number; search?: string }
): Promise<Product[]> {
  try {
    const supabase = await createServerClient();

    let query = supabase
      .from('products')
      .select('*')
      .eq('vendor_category_id', categoryId)
      .eq('is_active', true)
      .eq('is_published', true)
      .order('name', { ascending: true });

    if (options?.search) {
      query = query.ilike('name', `%${options.search}%`);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching grocery products:', error);
      return [];
    }

    return data as Product[];
  } catch (error) {
    console.error('Error fetching grocery products:', error);
    return [];
  }
}

/**
 * Get a single vendor category by ID from vendor_categories table
 */
export async function getVendorCategory(categoryId: string): Promise<VendorCategory | null> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('vendor_categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (error) {
      console.error('Error fetching vendor category:', error);
      return null;
    }

    return data as VendorCategory;
  } catch (error) {
    console.error('Error fetching vendor category:', error);
    return null;
  }
}
