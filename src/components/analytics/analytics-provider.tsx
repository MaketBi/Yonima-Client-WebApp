"use client";

import { GoogleAnalytics } from "./google-analytics";
import { FacebookPixel } from "./facebook-pixel";

/**
 * Analytics Provider - includes all analytics scripts
 * Add this to your root layout to enable analytics tracking
 */
export function AnalyticsProvider() {
  return (
    <>
      <GoogleAnalytics />
      <FacebookPixel />
    </>
  );
}
