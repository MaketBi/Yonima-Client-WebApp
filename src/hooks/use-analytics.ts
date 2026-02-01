"use client";

import { useCallback } from "react";
import {
  trackViewItem,
  trackAddToCart,
  trackRemoveFromCart,
  trackViewCart,
  trackBeginCheckout,
  trackAddPaymentInfo,
  trackAddShippingInfo,
  trackPurchase,
  trackSearch,
  trackSignUp,
  trackLogin,
  trackViewVendor,
} from "@/components/analytics/google-analytics";
import {
  fbTrackViewContent,
  fbTrackAddToCart,
  fbTrackInitiateCheckout,
  fbTrackAddPaymentInfo,
  fbTrackPurchase,
  fbTrackSearch,
  fbTrackCompleteRegistration,
} from "@/components/analytics/facebook-pixel";

interface ProductData {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  category?: string;
  vendor?: string;
}

interface OrderData {
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
}

interface VendorData {
  id: string;
  name: string;
  type: string;
}

/**
 * Unified analytics hook for tracking events across GA4 and Facebook Pixel
 */
export function useAnalytics() {
  /**
   * Track when user views a product
   */
  const trackProductView = useCallback((product: ProductData) => {
    // Google Analytics
    trackViewItem({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      vendor: product.vendor,
    });

    // Facebook Pixel
    fbTrackViewContent({
      id: product.id,
      name: product.name,
      category: product.category,
      value: product.price,
    });
  }, []);

  /**
   * Track when user views a vendor/establishment
   */
  const trackVendorView = useCallback((vendor: VendorData) => {
    // Google Analytics
    trackViewVendor(vendor);

    // Facebook Pixel
    fbTrackViewContent({
      id: vendor.id,
      name: vendor.name,
      category: vendor.type,
    });
  }, []);

  /**
   * Track adding item to cart
   */
  const trackCartAdd = useCallback((product: ProductData) => {
    const quantity = product.quantity || 1;

    // Google Analytics
    trackAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      category: product.category,
      vendor: product.vendor,
    });

    // Facebook Pixel
    fbTrackAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      category: product.category,
    });
  }, []);

  /**
   * Track removing item from cart
   */
  const trackCartRemove = useCallback((product: ProductData) => {
    // Google Analytics only (FB doesn't have remove from cart)
    trackRemoveFromCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: product.quantity || 1,
    });
  }, []);

  /**
   * Track viewing cart
   */
  const trackCartView = useCallback(
    (
      items: Array<{ id: string; name: string; price: number; quantity: number }>,
      total: number
    ) => {
      // Google Analytics
      trackViewCart(items, total);
    },
    []
  );

  /**
   * Track checkout initiation
   */
  const trackCheckoutStart = useCallback(
    (
      items: Array<{ id: string; name: string; price: number; quantity: number }>,
      total: number
    ) => {
      const numItems = items.reduce((sum, item) => sum + item.quantity, 0);

      // Google Analytics
      trackBeginCheckout(items, total);

      // Facebook Pixel
      fbTrackInitiateCheckout({
        items,
        total,
        numItems,
      });
    },
    []
  );

  /**
   * Track adding delivery address
   */
  const trackDeliveryInfo = useCallback((neighborhood: string, total: number) => {
    // Google Analytics
    trackAddShippingInfo(neighborhood, total);
  }, []);

  /**
   * Track adding payment method
   */
  const trackPaymentMethod = useCallback((paymentMethod: string, total: number) => {
    // Google Analytics
    trackAddPaymentInfo(paymentMethod, total);

    // Facebook Pixel
    fbTrackAddPaymentInfo({
      total,
      paymentMethod,
    });
  }, []);

  /**
   * Track successful order
   */
  const trackOrder = useCallback((order: OrderData) => {
    const numItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

    // Google Analytics
    trackPurchase(order);

    // Facebook Pixel
    fbTrackPurchase({
      orderId: order.orderId,
      total: order.total,
      items: order.items,
      numItems,
    });
  }, []);

  /**
   * Track search query
   */
  const trackSearchQuery = useCallback((query: string) => {
    if (!query.trim()) return;

    // Google Analytics
    trackSearch(query);

    // Facebook Pixel
    fbTrackSearch(query);
  }, []);

  /**
   * Track user signup
   */
  const trackUserSignup = useCallback((method: string = "phone") => {
    // Google Analytics
    trackSignUp(method);

    // Facebook Pixel
    fbTrackCompleteRegistration(method);
  }, []);

  /**
   * Track user login
   */
  const trackUserLogin = useCallback((method: string = "phone") => {
    // Google Analytics
    trackLogin(method);
  }, []);

  return {
    trackProductView,
    trackVendorView,
    trackCartAdd,
    trackCartRemove,
    trackCartView,
    trackCheckoutStart,
    trackDeliveryInfo,
    trackPaymentMethod,
    trackOrder,
    trackSearchQuery,
    trackUserSignup,
    trackUserLogin,
  };
}
