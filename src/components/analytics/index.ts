export { GoogleAnalytics } from "./google-analytics";
export { FacebookPixel } from "./facebook-pixel";
export { AnalyticsProvider } from "./analytics-provider";

// Re-export tracking functions
export {
  trackEvent,
  trackPageView,
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
} from "./google-analytics";

export {
  fbTrackEvent,
  fbTrackCustomEvent,
  fbTrackViewContent,
  fbTrackAddToCart,
  fbTrackInitiateCheckout,
  fbTrackAddPaymentInfo,
  fbTrackPurchase,
  fbTrackSearch,
  fbTrackCompleteRegistration,
  fbTrackLead,
} from "./facebook-pixel";
