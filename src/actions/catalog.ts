'use server';

import { createServerClient } from '@/lib/supabase/server';
import type { Vendor, Product, Category, Pack, VendorType } from '@/types/models';

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
 * Get categories for a vendor
 */
export async function getVendorCategories(vendorId: string): Promise<Category[]> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data as Category[];
  } catch (error) {
    console.error('Error fetching categories:', error);
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
      query = query.eq('category_id', options.categoryId);
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
 * Get grocery categories (for epicerie page)
 */
export async function getGroceryCategories(): Promise<Category[]> {
  try {
    const supabase = await createServerClient();

    // Get all categories from grocery vendors
    const { data: vendors } = await supabase
      .from('vendors')
      .select('id')
      .eq('type', 'grocery')
      .eq('is_active', true);

    if (!vendors || vendors.length === 0) {
      return [];
    }

    const vendorIds = vendors.map((v) => v.id);

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .in('vendor_id', vendorIds)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching grocery categories:', error);
      return [];
    }

    // Deduplicate by name
    const uniqueCategories = data.reduce((acc: Category[], category) => {
      if (!acc.find((c) => c.name.toLowerCase() === category.name.toLowerCase())) {
        acc.push(category);
      }
      return acc;
    }, []);

    return uniqueCategories;
  } catch (error) {
    console.error('Error fetching grocery categories:', error);
    return [];
  }
}

/**
 * Get products by grocery category name
 */
export async function getGroceryProductsByCategory(
  categoryName: string,
  options?: { limit?: number; offset?: number }
): Promise<Product[]> {
  try {
    const supabase = await createServerClient();

    // Get categories with this name
    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .ilike('name', categoryName);

    if (!categories || categories.length === 0) {
      return [];
    }

    const categoryIds = categories.map((c) => c.id);

    let query = supabase
      .from('products')
      .select('*, vendor:vendors(id, name, logo_url, type)')
      .in('category_id', categoryIds)
      .eq('is_active', true)
      .eq('is_published', true)
      .order('popularity_score', { ascending: false });

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
