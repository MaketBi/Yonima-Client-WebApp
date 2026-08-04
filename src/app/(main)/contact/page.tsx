import { Metadata } from 'next';
import Link from 'next/link';
import { BreadcrumbJsonLd } from '@/components/seo';
import { APP_NAME, COMPANY, IOS_APP_URL, ANDROID_APP_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Contactez ${APP_NAME}, votre service de livraison à Dakar. Une question sur une commande, un partenariat ou l'application ? Écrivez-nous.`,
  alternates: {
    canonical: '/contact',
  },
};

const breadcrumbs = [
  { name: 'Accueil', url: '/' },
  { name: 'Contact', url: '/contact' },
];

export default function ContactPage() {
  return (
    <div className="container max-w-2xl py-6 md:py-10">
      <BreadcrumbJsonLd items={breadcrumbs} />

      <h1 className="text-2xl md:text-3xl font-bold">Contact</h1>
      <p className="mt-2 text-muted-foreground">
        Une question, une remarque ou une demande de partenariat ? L&apos;équipe {APP_NAME}
        {' '}vous répond.
      </p>

      <div className="mt-8 space-y-6">
        <section>
          <h2 className="font-semibold mb-1">Email</h2>
          <a
            href={`mailto:${COMPANY.email}`}
            className="text-primary hover:underline break-all"
          >
            {COMPANY.email}
          </a>
        </section>

        <section>
          <h2 className="font-semibold mb-1">Téléphone</h2>
          <a
            href={`tel:${COMPANY.phone.replace(/\s+/g, '')}`}
            className="text-primary hover:underline"
          >
            {COMPANY.phone}
          </a>
        </section>

        <section>
          <h2 className="font-semibold mb-1">Zone desservie</h2>
          <p className="text-muted-foreground">{COMPANY.address}</p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">Nos applications</h2>
          <p className="text-muted-foreground mb-3">
            Commandez encore plus facilement depuis l&apos;application {APP_NAME}.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={IOS_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-xl border px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary transition-colors"
            >
              App Store
            </Link>
            <Link
              href={ANDROID_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-xl border px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary transition-colors"
            >
              Google Play
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
