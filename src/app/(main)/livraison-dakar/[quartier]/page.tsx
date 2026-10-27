import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getVendorsByType } from '@/actions/catalog';
import { EstablishmentList } from '@/components/establishment/establishment-list';
import { BreadcrumbJsonLd, ItemListJsonLd } from '@/components/seo';
import { Skeleton } from '@/components/ui/skeleton';
import { QUARTIERS_CONTENT, getQuartierContent } from '@/lib/quartiers-content';
import { CUISINES_CONTENT } from '@/lib/cuisines-content';
import { ROUTES } from '@/lib/constants';

interface Props {
  params: Promise<{ quartier: string }>;
}

// Pas de generateStaticParams, comme les pages cuisine : la liste passe par le
// client Supabase, qui lit les cookies — rendu à la demande.

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { quartier: slug } = await params;
  const quartier = getQuartierContent(slug);

  if (!quartier) {
    return { title: 'Quartier introuvable' };
  }

  return {
    // Le layout applique déjà le template `%s | Yonima`.
    title: quartier.title,
    description: quartier.description,
    keywords: [
      `livraison ${quartier.label}`,
      `livraison repas ${quartier.label}`,
      `restaurant ${quartier.label}`,
      'Dakar',
      'livraison',
      'commande en ligne',
    ],
    openGraph: {
      title: `${quartier.title} | Yonima`,
      description: quartier.description,
      type: 'article',
    },
    alternates: {
      canonical: `${ROUTES.livraisonDakar}/${quartier.slug}`,
    },
  };
}

function QuartierSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="rounded-lg overflow-hidden">
          <Skeleton className="aspect-[16/10] w-full" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function QuartierRestaurants({ name, label }: { name: string; label: string }) {
  const restaurants = await getVendorsByType('restaurant', { neighborhood: name });

  return (
    <>
      {restaurants.length > 0 && (
        <ItemListJsonLd
          name={`Restaurants à ${label}, Dakar`}
          items={restaurants.map((vendor, index) => ({
            name: vendor.name,
            url: `/restaurants/${vendor.slug || vendor.id}`,
            image: vendor.cover_image_url || vendor.logo_url || undefined,
            position: index + 1,
          }))}
        />
      )}

      <EstablishmentList
        establishments={restaurants}
        type="restaurant"
        emptyMessage={`Aucun restaurant disponible à ${label} pour le moment. Revenez bientôt !`}
      />
    </>
  );
}

export default async function QuartierPage({ params }: Props) {
  const { quartier: slug } = await params;
  const quartier = getQuartierContent(slug);

  // Décidé avant le <Suspense> : en streaming SSR les headers partent avec le
  // shell, un notFound() plus bas renverrait un 200 (soft-404).
  if (!quartier) {
    notFound();
  }

  const breadcrumbs = [
    { name: 'Accueil', url: '/' },
    { name: 'Livraison à Dakar', url: ROUTES.livraisonDakar },
    { name: quartier.label, url: `${ROUTES.livraisonDakar}/${quartier.slug}` },
  ];

  const otherQuartiers = QUARTIERS_CONTENT.filter((q) => q.slug !== quartier.slug);

  return (
    <div className="container py-6">
      <BreadcrumbJsonLd items={breadcrumbs} />

      <nav aria-label="Fil d'ariane" className="mb-4 text-sm text-muted-foreground">
        <Link href={ROUTES.livraisonDakar} className="hover:text-foreground">
          Livraison à Dakar
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{quartier.label}</span>
      </nav>

      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">{quartier.title}</h1>
        <p className="text-muted-foreground mt-1">{quartier.tagline}</p>
      </header>

      <Suspense fallback={<QuartierSkeleton />}>
        <QuartierRestaurants name={quartier.name} label={quartier.label} />
      </Suspense>

      {/* Contenu éditorial après la liste : les restaurants restent la première
          chose vue, le texte porte le signal SEO. */}
      <section className="mt-10 max-w-3xl">
        <h2 className="text-xl font-semibold mb-3">
          Se faire livrer à {quartier.label}
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          {quartier.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
          <p>
            <Link href={ROUTES.livraisonDakar} className="text-primary hover:underline">
              Délais, tarifs et moyens de paiement : comment fonctionne la livraison à Dakar
            </Link>
          </p>
        </div>
      </section>

      {/* Maillage latéral entre quartiers, puis vers les pages cuisine : des
          liens en dur, lisibles sans exécution de JS. */}
      <section className="mt-10">
        <h2 className="text-sm font-semibold mb-3">Autres quartiers de Dakar</h2>
        <ul className="flex flex-wrap gap-2">
          {otherQuartiers.map((other) => (
            <li key={other.slug}>
              <Link
                href={`${ROUTES.livraisonDakar}/${other.slug}`}
                className="inline-flex items-center rounded-full border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
              >
                {other.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold mb-3">Par type de cuisine</h2>
        <ul className="flex flex-wrap gap-2">
          {CUISINES_CONTENT.map((cuisine) => (
            <li key={cuisine.slug}>
              <Link
                href={`/restaurants/cuisine/${cuisine.slug}`}
                className="inline-flex items-center rounded-full border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
              >
                {cuisine.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
