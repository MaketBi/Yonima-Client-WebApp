import { Suspense } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import {
  ANDROID_APP_URL,
  APP_NAME,
  COMPANY,
  IOS_APP_URL,
  ROUTES,
  SOCIAL_LINKS,
} from '@/lib/constants';
import { LinkButton } from './link-buttons';
import {
  AndroidIcon,
  AppleIcon,
  FacebookIcon,
  InstagramIcon,
  StoreIcon,
  TikTokIcon,
  WhatsAppIcon,
} from './icons';

/**
 * `/app` — page « link in bio » pour Instagram, TikTok et Facebook.
 *
 * Délibérément hors du groupe `(main)` : pas de header, footer ni bottom-nav.
 * Une bio ne doit ouvrir qu'une liste de choix, sans navigation concurrente.
 *
 * Elle est indexable (une recherche « application Yonima » doit la trouver),
 * mais absente du sitemap : c'est une page d'atterrissage marketing, pas du
 * contenu que l'on cherche à faire ranker.
 */

export const metadata: Metadata = {
  title: `Télécharger l'application ${APP_NAME}`,
  description: `Téléchargez ${APP_NAME} sur iPhone et Android, ou commandez directement en ligne. Livraison de repas et de courses à Dakar.`,
  alternates: {
    canonical: ROUTES.app,
  },
  openGraph: {
    title: `Télécharger l'application ${APP_NAME}`,
    description: 'Livraison de repas et de courses à Dakar.',
    type: 'website',
  },
};

// Le numéro WhatsApp doit être en chiffres uniquement dans une URL wa.me.
const whatsappNumber = COMPANY.whatsapp.replace(/\D/g, '');

const socialButtons = [
  {
    key: 'instagram',
    href: SOCIAL_LINKS.instagram,
    label: 'Instagram',
    icon: <InstagramIcon />,
  },
  {
    key: 'tiktok',
    href: SOCIAL_LINKS.tiktok,
    label: 'TikTok',
    icon: <TikTokIcon />,
  },
  {
    key: 'facebook',
    href: SOCIAL_LINKS.facebook,
    label: 'Facebook',
    icon: <FacebookIcon />,
  },
  // Un compte dont l'URL n'est pas encore renseignée n'affiche pas son bouton,
  // plutôt qu'un lien mort.
].filter((social) => social.href.length > 0);

export default function AppLinksPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-10">
      <header className="flex flex-col items-center text-center">
        <Image
          src="/icons/icon-192x192.png"
          alt=""
          width={80}
          height={80}
          className="rounded-[var(--radius-2xl)] shadow-sm"
          priority
        />
        <h1 className="mt-4 text-2xl font-bold">{APP_NAME}</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">
          Livraison de repas et de courses à Dakar
        </p>
      </header>

      {/* Suspense : LinkButton lit la query string via useSearchParams, ce qui
          exige une frontière de suspense au prerender. */}
      <Suspense fallback={<div className="mt-8 h-64" />}>
        <nav aria-label="Nos liens" className="mt-8 flex flex-col gap-3">
          <LinkButton
            href={IOS_APP_URL}
            eventLabel="ios_app_store"
            icon={<AppleIcon />}
            label="Télécharger sur iPhone"
            hint="App Store"
            variant="primary"
          />
          <LinkButton
            href={ANDROID_APP_URL}
            eventLabel="android_play_store"
            icon={<AndroidIcon />}
            label="Télécharger sur Android"
            hint="Google Play"
            variant="primary"
          />
          <LinkButton
            href={`https://wa.me/${whatsappNumber}`}
            eventLabel="whatsapp"
            icon={<WhatsAppIcon />}
            label="Nous écrire sur WhatsApp"
            hint={COMPANY.whatsapp}
          />
          <LinkButton
            href="https://www.poulzz.com/get/business"
            eventLabel="become_vendor"
            icon={<StoreIcon />}
            label="Devenir vendeur partenaire"
            hint="Restaurants, commerces et épiceries"
          />

          {socialButtons.map((social) => (
            <LinkButton
              key={social.key}
              href={social.href}
              eventLabel={social.key}
              icon={social.icon}
              label={social.label}
            />
          ))}
        </nav>
      </Suspense>

      <footer className="mt-auto pt-10 text-center text-[13px] text-muted-foreground">
        {COMPANY.legalName}
      </footer>
    </main>
  );
}
