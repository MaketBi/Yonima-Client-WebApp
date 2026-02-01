import { MetadataRoute } from "next";
import { createServerClient } from "@/lib/supabase/server";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://www.poulzz.store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createServerClient();

  // Get all active vendors
  const { data: vendors } = await supabase
    .from("vendors")
    .select("slug, type, updated_at")
    .eq("is_active", true);

  // Get all grocery categories
  const { data: groceryCategories } = await supabase
    .from("vendor_categories")
    .select("id, updated_at")
    .eq("is_active", true);

  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/restaurants`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/commerces`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/epicerie`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Vendor pages (restaurants and stores)
  const vendorPages: MetadataRoute.Sitemap =
    vendors?.map((vendor) => {
      const basePath = vendor.type === "restaurant" ? "restaurants" : "commerces";
      return {
        url: `${BASE_URL}/${basePath}/${vendor.slug}`,
        lastModified: vendor.updated_at ? new Date(vendor.updated_at) : now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      };
    }) || [];

  // Grocery category pages
  const groceryPages: MetadataRoute.Sitemap =
    groceryCategories?.map((category) => ({
      url: `${BASE_URL}/epicerie/${category.id}`,
      lastModified: category.updated_at ? new Date(category.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })) || [];

  return [...staticPages, ...vendorPages, ...groceryPages];
}
