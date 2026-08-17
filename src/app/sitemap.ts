import { MetadataRoute } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { getGroceryCategories } from "@/actions/catalog";
import { CUISINES_CONTENT } from "@/lib/cuisines-content";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://www.poulzz.store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createServerClient();

  // Get all active vendors
  const { data: vendors } = await supabase
    .from("vendors")
    .select("slug, type, updated_at")
    .eq("is_active", true)
    .not("slug", "is", null);

  // Get all grocery categories.
  // On réutilise getGroceryCategories() : une requête directe sur vendor_categories
  // sans passer par le vendor grocery ne retourne rien (RLS), ce qui vidait
  // silencieusement le sitemap de ses 20 pages catégorie.
  const { categories: groceryCategories } = await getGroceryCategories();

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
    {
      url: `${BASE_URL}/apropos`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Cuisine landing pages (contenu éditorial statique, ensemble fermé)
  const cuisinePages: MetadataRoute.Sitemap = CUISINES_CONTENT.map((cuisine) => ({
    url: `${BASE_URL}/restaurants/cuisine/${cuisine.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Vendor pages (restaurants and stores)
  const vendorPages: MetadataRoute.Sitemap =
    vendors
      ?.filter((vendor) => vendor.slug && vendor.slug.trim())
      .map((vendor) => {
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
      lastModified: category.created_at ? new Date(category.created_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })) || [];

  return [...staticPages, ...cuisinePages, ...vendorPages, ...groceryPages];
}
