import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { APP_NAME } from "@/lib/constants";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { AnalyticsProvider } from "@/components/analytics";
import { CartProvider } from "@/providers/cart-provider";

// Outfit is the single Yonima typeface (design system). Arial is the sanctioned fallback.
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
  fallback: ["Arial", "Helvetica", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} - Livraison rapide à Dakar`,
    template: `%s | ${APP_NAME}`,
  },
  description: "Commandez vos repas et courses préférés et faites-vous livrer rapidement à Dakar. Restaurants, commerces et épicerie à portée de main.",
  keywords: ["livraison", "Dakar", "restaurant", "épicerie", "courses", "Sénégal"],
  authors: [{ name: APP_NAME }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: true,
  },
  openGraph: {
    type: "website",
    locale: "fr_SN",
    siteName: APP_NAME,
    title: `${APP_NAME} - Livraison rapide à Dakar`,
    description: "Commandez vos repas et courses préférés et faites-vous livrer rapidement à Dakar.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} - Livraison rapide à Dakar`,
    description: "Commandez vos repas et courses préférés et faites-vous livrer rapidement à Dakar.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Allow zooming for accessibility (removed maximumScale: 1)
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${outfit.variable} font-sans antialiased min-h-screen bg-background`}
      >
        <CartProvider>
          {children}
        </CartProvider>
        <Toaster />
        <ServiceWorkerRegistration />
        <AnalyticsProvider />
      </body>
    </html>
  );
}
