'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_NAME } from '@/lib/constants';

const STORAGE_KEY = 'app-banner-dismissed';
const DISMISS_DURATION_DAYS = 7; // Show again after 7 days

export function AppInstallBanner() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | null>(null);

  useEffect(() => {
    // Check if running in standalone mode (PWA installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // Check if dismissed recently
    const dismissedAt = localStorage.getItem(STORAGE_KEY);
    if (dismissedAt) {
      const dismissedDate = new Date(dismissedAt);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < DISMISS_DURATION_DAYS) return;
    }

    // Detect platform
    const userAgent = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setPlatform('ios');
      setShow(true);
    } else if (/android/i.test(userAgent)) {
      setPlatform('android');
      setShow(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    setShow(false);
  };

  const getStoreLink = () => {
    const iosAppUrl = process.env.NEXT_PUBLIC_IOS_APP_URL;
    const androidAppUrl = process.env.NEXT_PUBLIC_ANDROID_APP_URL;

    if (platform === 'ios') {
      // TestFlight or App Store URL
      return iosAppUrl || 'https://apps.apple.com/app/poulzz';
    }
    // Play Store URL
    return androidAppUrl || 'https://play.google.com/store/apps/details?id=com.poulzz.app';
  };

  const getStoreName = () => {
    if (platform === 'ios') {
      return 'App Store';
    }
    return 'Play Store';
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-between max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-primary/10">
            <Image
              src="/icon-192.png"
              alt={APP_NAME}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-semibold text-sm">{APP_NAME}</p>
            <p className="text-xs text-muted-foreground">
              Meilleure expérience sur l&apos;app
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className="rounded-full px-4"
          >
            <a href={getStoreLink()} target="_blank" rel="noopener noreferrer">
              {getStoreName()}
            </a>
          </Button>
          <button
            onClick={handleDismiss}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
