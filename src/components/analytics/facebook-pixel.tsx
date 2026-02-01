"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

// Declare fbq on window
declare global {
  interface Window {
    fbq: (
      command: "init" | "track" | "trackCustom",
      eventNameOrPixelId: string,
      parameters?: Record<string, unknown>
    ) => void;
    _fbq: typeof window.fbq;
  }
}

export function FacebookPixel() {
  const pathname = usePathname();

  useEffect(() => {
    if (!FB_PIXEL_ID || typeof window.fbq !== "function") return;

    window.fbq("track", "PageView");
  }, [pathname]);

  if (!FB_PIXEL_ID) {
    return null;
  }

  return (
    <>
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

// ============================================
// TRACKING FUNCTIONS
// ============================================

/**
 * Track a custom Facebook event
 */
export function fbTrackEvent(
  eventName: string,
  parameters?: Record<string, unknown>
) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", eventName, parameters);
  }
}

/**
 * Track a custom event (non-standard)
 */
export function fbTrackCustomEvent(
  eventName: string,
  parameters?: Record<string, unknown>
) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("trackCustom", eventName, parameters);
  }
}

/**
 * Track when user views content (product or establishment)
 */
export function fbTrackViewContent(content: {
  id: string;
  name: string;
  category?: string;
  value?: number;
}) {
  fbTrackEvent("ViewContent", {
    content_ids: [content.id],
    content_name: content.name,
    content_category: content.category,
    content_type: "product",
    value: content.value,
    currency: "XOF",
  });
}

/**
 * Track when user adds to cart
 */
export function fbTrackAddToCart(item: {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}) {
  fbTrackEvent("AddToCart", {
    content_ids: [item.id],
    content_name: item.name,
    content_type: "product",
    content_category: item.category,
    value: item.price * item.quantity,
    currency: "XOF",
    num_items: item.quantity,
  });
}

/**
 * Track when user initiates checkout
 */
export function fbTrackInitiateCheckout(data: {
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
  total: number;
  numItems: number;
}) {
  fbTrackEvent("InitiateCheckout", {
    content_ids: data.items.map((i) => i.id),
    contents: data.items.map((i) => ({
      id: i.id,
      quantity: i.quantity,
      item_price: i.price,
    })),
    content_type: "product",
    value: data.total,
    currency: "XOF",
    num_items: data.numItems,
  });
}

/**
 * Track when user adds payment info
 */
export function fbTrackAddPaymentInfo(data: {
  total: number;
  paymentMethod: string;
}) {
  fbTrackEvent("AddPaymentInfo", {
    value: data.total,
    currency: "XOF",
    content_category: data.paymentMethod,
  });
}

/**
 * Track successful purchase
 */
export function fbTrackPurchase(order: {
  orderId: string;
  total: number;
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
  numItems: number;
}) {
  fbTrackEvent("Purchase", {
    content_ids: order.items.map((i) => i.id),
    contents: order.items.map((i) => ({
      id: i.id,
      quantity: i.quantity,
      item_price: i.price,
    })),
    content_type: "product",
    value: order.total,
    currency: "XOF",
    num_items: order.numItems,
    order_id: order.orderId,
  });
}

/**
 * Track search
 */
export function fbTrackSearch(searchString: string) {
  fbTrackEvent("Search", {
    search_string: searchString,
  });
}

/**
 * Track user registration
 */
export function fbTrackCompleteRegistration(method: string = "phone") {
  fbTrackEvent("CompleteRegistration", {
    content_name: method,
    status: true,
  });
}

/**
 * Track lead (e.g., newsletter signup)
 */
export function fbTrackLead(data?: { value?: number; category?: string }) {
  fbTrackEvent("Lead", {
    value: data?.value,
    currency: "XOF",
    content_category: data?.category,
  });
}
