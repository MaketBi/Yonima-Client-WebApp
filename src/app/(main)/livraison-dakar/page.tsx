import { Metadata } from 'next';
import Link from 'next/link';
import { BreadcrumbJsonLd, FAQJsonLd } from '@/components/seo';
import { LIVRAISON_FAQ, LIVRAISON_INTRO } from '@/lib/livraison-content';
import { CUISINES_CONTENT } from '@/lib/cuisines-content';
import { APP_NAME, ROUTES, cuisineEmoji } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Livraison à Dakar : délais, tarifs et fonctionnement',
  description:
    "Comment fonctionne la livraison à Dakar : délais, frais de livraison, moyens de paiement (Wave, Orange Money, espèces), quartiers desservis et suivi de commande.",
  keywords: [
    'livraison Dakar',
    'livraison repas Dakar',
    'délai livraison Dakar',
    'frais de livraison Dakar',
    'paiement Wave Orange Money',
    'Sénégal',
  ],
  openGraph: {
    title: `Livraison à Dakar : délais, tarifs et fonctionnement | ${APP_NAME}`,
    description:
      "Délais, tarifs, moyens de paiement et zones desservies : tout ce qu'il faut savoir sur la livraison à Dakar.",
    type: 'article',
  },
  alternates: {
    canonical: ROUTES.livraisonDakar,
  },
};

const breadcrumbs = [
  { name: 'Accueil', url: ROUTES.home },
  { name: 'Livraison à Dakar', url: ROUTES.livraisonDakar },
];

export default function LivraisonDakarPage() {
  return (
    <div className="container max-w-3xl py-6 md:py-10">
      <BreadcrumbJsonLd items={breadcrumbs} />

      {/* FAQPage : ici pour la lecture machine (ChatGPT, Perplexity, AI Overviews),
          qui s'appuie sur ce balisage pour apparier question et réponse. Ce n'est
          PAS une tentative de récupérer les rich results FAQ, retirés des SERP par
          Google le 2026-05-07 — cette piste-là reste écartée. */}
      <FAQJsonLd questions={LIVRAISON_FAQ} />

      <nav aria-label="Fil d'ariane" className="mb-4 text-sm text-muted-foreground">
        <Link href={ROUTES.home} className="hover:text-foreground">
          Accueil
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Livraison à Dakar</span>
      </nav>

      <header>
        <h1 className="text-2xl md:text-3xl font-bold">
          La livraison à Dakar avec {APP_NAME}
        </h1>
        {/* Le résumé porte les faits chiffrés : c'est le passage qu'une IA cite
            quand elle n'en retient qu'un seul. */}
        <p className="mt-4 leading-relaxed">{LIVRAISON_INTRO}</p>
      </header>

      {/* Une question = un <h2> formulé comme la requête, une réponse autonome.
          Le H2 sert d'ancre d'extraction : un moteur génératif apparie la question
          de l'utilisateur au titre, puis cite le paragraphe qui suit. */}
      <div className="mt-10 space-y-8">
        {LIVRAISON_FAQ.map((entry) => (
          <section key={entry.question}>
            <h2 className="text-xl font-semibold mb-2">{entry.question}</h2>
            <p className="leading-relaxed text-muted-foreground">{entry.answer}</p>
          </section>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-3">Commander à Dakar</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Parcourez les restaurants par type de cuisine, ou retrouvez les commerces de proximité et
          l&apos;épicerie du quotidien.
        </p>
        <ul className="flex flex-wrap gap-2">
          {CUISINES_CONTENT.map((cuisine) => (
            <li key={cuisine.slug}>
              <Link
                href={`/restaurants/cuisine/${cuisine.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
              >
                <span aria-hidden="true">{cuisineEmoji(cuisine.tag)}</span>
                {cuisine.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <Link href={ROUTES.restaurants} className="text-primary hover:underline">
            Tous les restaurants
          </Link>
          <Link href={ROUTES.commerces} className="text-primary hover:underline">
            Commerces
          </Link>
          <Link href={ROUTES.epicerie} className="text-primary hover:underline">
            Épicerie
          </Link>
          <Link href={ROUTES.apropos} className="text-primary hover:underline">
            À propos de {APP_NAME}
          </Link>
        </div>
      </section>
    </div>
  );
}
