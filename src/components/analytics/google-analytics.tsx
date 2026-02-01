"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Declare gtag on window
declare global {
  interface Window {
    gtag: (
      command: "config" | "event" | "js" | "set",
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

function GoogleAnalyticsTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || typeof window.gtag !== "function") return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }, [pathname, searchParams]);

  return null;
}

export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              send_page_view: false
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <GoogleAnalyticsTracking />
      </Suspense>
    </>
  );
}

// ============================================
// TRACKING FUNCTIONS
// ============================================

/**
 * Track a custom event
 */
export function trackEvent(
  eventName: string,
  parameters?: Record<string, unknown>
) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, parameters);
  }
}

/**
 * Track page view (called automatically by GoogleAnalytics component)
 */
export function trackPageView(url: string) {
  if (!GA_MEASUREMENT_ID) return;
  trackEvent("page_view", {
    page_path: url,
  });
}

/**
 * Track when user views a product
 */
export function trackViewItem(item: {
  id: string;
  name: string;
  price: number;
  category?: string;
  vendor?: string;
}) {
  trackEvent("view_item", {
    currency: "XOF",
    value: item.price,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        item_category: item.category,
        item_brand: item.vendor,
      },
    ],
  });
}

/**
 * Track when user adds item to cart
 */
export function trackAddToCart(item: {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  vendor?: string;
}) {
  trackEvent("add_to_cart", {
    currency: "XOF",
    value: item.price * item.quantity,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
        item_category: item.category,
        item_brand: item.vendor,
      },
    ],
  });
}

/**
 * Track when user removes item from cart
 */
export function trackRemoveFromCart(item: {
  id: string;
  name: string;
  price: number;
  quantity: number;
}) {
  trackEvent("remove_from_cart", {
    currency: "XOF",
    value: item.price * item.quantity,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      },
    ],
  });
}

/**
 * Track when user views cart
 */
export function trackViewCart(items: Array<{
  id: string;
  name: string;
  price: number;
  quantity: number;
}>, total: number) {
  trackEvent("view_cart", {
    currency: "XOF",
    value: total,
    items: items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
}

/**
 * Track when user begins checkout
 */
export function trackBeginCheckout(items: Array<{
  id: string;
  name: string;
  price: number;
  quantity: number;
}>, total: number) {
  trackEvent("begin_checkout", {
    currency: "XOF",
    value: total,
    items: items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
}

/**
 * Track when user adds payment info
 */
export function trackAddPaymentInfo(paymentMethod: string, total: number) {
  trackEvent("add_payment_info", {
    currency: "XOF",
    value: total,
    payment_type: paymentMethod,
  });
}

/**
 * Track when user adds shipping info (delivery address)
 */
export function trackAddShippingInfo(neighborhood: string, total: number) {
  trackEvent("add_shipping_info", {
    currency: "XOF",
    value: total,
    shipping_tier: neighborhood,
  });
}

/**
 * Track successful purchase
 */
export function trackPurchase(order: {
  orderId: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  paymentMethod: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}) {
  trackEvent("purchase", {
    transaction_id: order.orderId,
    currency: "XOF",
    value: order.total,
    shipping: order.deliveryFee,
    items: order.items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
}

/**
 * Track search
 */
export function trackSearch(searchTerm: string) {
  trackEvent("search", {
    search_term: searchTerm,
  });
}

/**
 * Track when user signs up
 */
export function trackSignUp(method: string = "phone") {
  trackEvent("sign_up", {
    method,
  });
}

/**
 * Track when user logs in
 */
export function trackLogin(method: string = "phone") {
  trackEvent("login", {
    method,
  });
}

/**
 * Track when user views a vendor/establishment
 */
export function trackViewVendor(vendor: {
  id: string;
  name: string;
  type: string;
}) {
  trackEvent("view_item_list", {
    item_list_id: vendor.id,
    item_list_name: vendor.name,
    items: [
      {
        item_id: vendor.id,
        item_name: vendor.name,
        item_category: vendor.type,
      },
    ],
  });
}
