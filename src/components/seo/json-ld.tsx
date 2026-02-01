import { APP_NAME } from "@/lib/constants";
import type { Vendor, Product } from "@/types/models";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://www.poulzz.store";

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Organization schema for the main site
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: APP_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/icons/icon-512x512.png`,
    description: "Livraison rapide à Dakar - Restaurants, commerces et épicerie",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dakar",
      addressCountry: "SN",
    },
    areaServed: {
      "@type": "City",
      name: "Dakar",
      "@id": "https://www.wikidata.org/wiki/Q3718",
    },
    sameAs: [],
  };

  return <JsonLd data={data} />;
}

// WebSite schema with search action
export function WebSiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_NAME,
    url: BASE_URL,
    description: "Commandez vos repas et courses préférés et faites-vous livrer rapidement à Dakar",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/restaurants?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return <JsonLd data={data} />;
}

// Restaurant schema for vendor pages
export function RestaurantJsonLd({ vendor }: { vendor: Vendor }) {
  const vendorUrl =
    vendor.type === "restaurant"
      ? `${BASE_URL}/restaurants/${vendor.slug}`
      : `${BASE_URL}/commerces/${vendor.slug}`;

  const data = {
    "@context": "https://schema.org",
    "@type": vendor.type === "restaurant" ? "Restaurant" : "Store",
    "@id": vendorUrl,
    name: vendor.name,
    description: vendor.description || `Commandez chez ${vendor.name} sur ${APP_NAME}`,
    url: vendorUrl,
    image: vendor.cover_image_url || vendor.logo_url,
    logo: vendor.logo_url,
    address: {
      "@type": "PostalAddress",
      streetAddress: vendor.address || "",
      addressLocality: "Dakar",
      addressCountry: "SN",
    },
    geo: vendor.latitude && vendor.longitude ? {
      "@type": "GeoCoordinates",
      latitude: vendor.latitude,
      longitude: vendor.longitude,
    } : undefined,
    telephone: vendor.phone || undefined,
    priceRange: "$$",
    servesCuisine: vendor.tags?.length ? vendor.tags[0] : undefined,
    aggregateRating: vendor.rating && vendor.review_count ? {
      "@type": "AggregateRating",
      ratingValue: vendor.rating,
      reviewCount: vendor.review_count,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
    openingHoursSpecification: vendor.opening_hours
      ? formatOpeningHours(vendor.opening_hours as Record<string, { open: string; close: string } | null>)
      : undefined,
    deliveryCharge: {
      "@type": "MonetaryAmount",
      value: vendor.delivery_fee || 1000,
      currency: "XOF",
    },
    potentialAction: {
      "@type": "OrderAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: vendorUrl,
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
        ],
      },
      deliveryMethod: "http://purl.org/goodrelations/v1#DeliveryModeOwnFleet",
    },
  };

  // Remove undefined values
  const cleanData = JSON.parse(JSON.stringify(data));

  return <JsonLd data={cleanData} />;
}

// Product schema for product pages
export function ProductJsonLd({ product, vendor }: { product: Product; vendor?: Vendor }) {
  const productUrl = `${BASE_URL}/produit/${product.id}`;

  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": productUrl,
    name: product.name,
    description: product.description || product.name,
    image: product.image_url,
    url: productUrl,
    sku: product.id,
    brand: vendor ? {
      "@type": "Brand",
      name: vendor.name,
    } : undefined,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "XOF",
      availability: product.is_available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: vendor ? {
        "@type": "Organization",
        name: vendor.name,
      } : undefined,
    },
  };

  const cleanData = JSON.parse(JSON.stringify(data));

  return <JsonLd data={cleanData} />;
}

// BreadcrumbList schema
export function BreadcrumbJsonLd({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
    })),
  };

  return <JsonLd data={data} />;
}

// ItemList schema for category pages
export function ItemListJsonLd({
  name,
  items,
}: {
  name: string;
  items: Array<{ name: string; url: string; image?: string; position: number }>;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      item: {
        "@type": "Thing",
        name: item.name,
        url: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
        image: item.image,
      },
    })),
  };

  return <JsonLd data={data} />;
}

// FAQ schema
export function FAQJsonLd({
  questions,
}: {
  questions: Array<{ question: string; answer: string }>;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };

  return <JsonLd data={data} />;
}

// Helper function to format opening hours
function formatOpeningHours(
  openingHours: Record<string, { open: string; close: string } | null>
): Array<{ "@type": string; dayOfWeek: string; opens: string; closes: string }> {
  const dayMap: Record<string, string> = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  return Object.entries(openingHours)
    .filter(([, hours]) => hours !== null)
    .map(([day, hours]) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: dayMap[day] || day,
      opens: hours!.open,
      closes: hours!.close,
    }));
}
