import { Metadata } from 'next';
import Link from 'next/link';
import { BreadcrumbJsonLd } from '@/components/seo';
import { APP_NAME, ROUTES, IOS_APP_URL, ANDROID_APP_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'À propos',
  description: `${APP_NAME}, c'est la livraison rapide à Dakar : restaurants, commerces et épicerie réunis dans une seule application. Découvrez notre mission.`,
  alternates: {
    canonical: '/apropos',
  },
};

const breadcrumbs = [
  { name: 'Accueil', url: '/' },
  { name: 'À propos', url: '/apropos' },
];

export default function AProposPage() {
  return (
    <div className="container max-w-3xl py-6 md:py-10">
      <BreadcrumbJsonLd items={breadcrumbs} />

      <h1 className="text-2xl md:text-3xl font-bold">À propos de {APP_NAME}</h1>

      <div className="mt-6 space-y-6 leading-relaxed">
        <p>
          {APP_NAME} est un service de livraison rapide pensé pour Dakar. Nous réunissons dans une
          seule application vos restaurants préférés, les commerces de proximité et l&apos;épicerie
          du quotidien — pour vous faire gagner du temps sur ce qui compte.
        </p>

        <section>
          <h2 className="text-xl font-semibold mb-2">Notre mission</h2>
          <p className="text-muted-foreground">
            Rendre la livraison simple, fiable et abordable partout à Dakar. Que vous commandiez un
            plat, vos courses ou un produit chez un commerçant du quartier, nous nous occupons de
            l&apos;acheminer rapidement jusqu&apos;à vous.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Ce que vous pouvez commander</h2>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>
              <Link href={ROUTES.restaurants} className="text-primary hover:underline">
                Restaurants
              </Link>{' '}
              — cuisine sénégalaise, fast-food, sushi, libanais, indien et bien plus.
            </li>
            <li>
              <Link href={ROUTES.commerces} className="text-primary hover:underline">
                Commerces
              </Link>{' '}
              — boutiques et services de proximité.
            </li>
            <li>
              <Link href={ROUTES.epicerie} className="text-primary hover:underline">
                Épicerie
              </Link>{' '}
              — vos courses essentielles livrées en quelques minutes.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Zone desservie</h2>
          <p className="text-muted-foreground">
            {APP_NAME} livre à Dakar, au Sénégal. Le paiement s&apos;effectue par Wave, Orange Money
            ou en espèces à la livraison.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Télécharger l&apos;application</h2>
          <p className="text-muted-foreground mb-3">
            Profitez de la meilleure expérience {APP_NAME} sur mobile.
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
