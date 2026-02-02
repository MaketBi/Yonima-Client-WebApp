'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Custom URL scheme for the native app
const APP_SCHEME = 'poulzz://';
const APP_LINK_STORAGE_KEY = 'deep-link-attempted';

export function DeepLinkRedirect() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    // Only run on mobile devices
    const userAgent = navigator.userAgent;
    const isMobile = /iPad|iPhone|iPod|android/i.test(userAgent);

    if (!isMobile) return;

    // Check if running in standalone mode (already in app)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // Check if we already attempted redirection for this session
    const sessionAttempted = sessionStorage.getItem(APP_LINK_STORAGE_KEY);
    if (sessionAttempted) return;

    // Build the deep link URL
    const queryString = searchParams.toString();
    const deepLinkPath = queryString ? `${pathname}?${queryString}` : pathname;
    const deepLinkUrl = `${APP_SCHEME}${deepLinkPath.startsWith('/') ? deepLinkPath.slice(1) : deepLinkPath}`;

    // Mark as attempted to avoid infinite loops
    sessionStorage.setItem(APP_LINK_STORAGE_KEY, 'true');
    setAttempted(true);

    // Try to open the native app
    // Using a hidden iframe for iOS and intent for Android
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const isAndroid = /android/i.test(userAgent);

    if (isIOS) {
      // iOS: Try Universal Link first, then custom scheme
      // The app should catch Universal Links automatically if configured properly
      // We also try the custom scheme as a fallback
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = deepLinkUrl;
      document.body.appendChild(iframe);

      // Clean up after attempt
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 2000);
    } else if (isAndroid) {
      // Android: Use intent URL for better app detection
      const packageName = 'com.yonima.client';
      const fallbackUrl = window.location.href;

      // Build Android intent URL
      const intentUrl = `intent://${deepLinkPath.startsWith('/') ? deepLinkPath.slice(1) : deepLinkPath}#Intent;scheme=poulzz;package=${packageName};S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};end`;

      // Try to open the intent
      window.location.href = intentUrl;
    }
  }, [pathname, searchParams]);

  // This component doesn't render anything visible
  return null;
}
