import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { APP_NAME } from "@/lib/constants";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} - Livraison rapide à Dakar`,
    template: `%s | ${APP_NAME}`,
  },
  description: "Commandez vos repas et courses préférés et faites-vous livrer rapidement à Dakar. Restaurants, commerces et épicerie à portée de main.",
  keywords: ["livraison", "Dakar", "restaurant", "épicerie", "courses", "Sénégal"],
  authors: [{ name: APP_NAME }],
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
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
