import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getVendorsByType } from '@/actions/catalog';
import { EstablishmentList } from '@/components/establishment/establishment-list';
import { BreadcrumbJsonLd, ItemListJsonLd } from '@/components/seo';
import { Skeleton } from '@/components/ui/skeleton';
import { CUISINES_CONTENT, getCuisineContent } from '@/lib/cuisines-content';
import { cuisineEmoji, ROUTES } from '@/lib/constants';

interface Props {
  params: Promise<{ slug: string }>;
}

// Pas de generateStaticParams : la liste des restaurants passe par le client
// Supabase, qui lit les cookies — la page est donc rendue à la demande, comme
// /restaurants et /commerces.

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cuisine = getCuisineContent(slug);

  if (!cuisine) {
    return { title: 'Cuisine introuvable' };
  }

  return {
    // Le layout applique déjà le template `%s | Yonima` — ne pas le dupliquer ici.
    title: cuisine.title,
    description: cuisine.description,
    keywords: [
      cuisine.label.toLowerCase(),
      `livraison ${cuisine.label.toLowerCase()} Dakar`,
      'Dakar',
      'livraison',
      'commande en ligne',
    ],
    openGraph: {
      title: `${cuisine.title} | Yonima`,
      description: cuisine.description,
      type: 'website',
    },
    alternates: {
      canonical: `/restaurants/cuisine/${cuisine.slug}`,
    },
  };
}

function CuisineSkeleton() {
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

async function CuisineRestaurants({ tag, label }: { tag: string; label: string }) {
  const restaurants = await getVendorsByType('restaurant', { cuisine: tag });

  return (
    <>
      {restaurants.length > 0 && (
        <ItemListJsonLd
          name={`Restaurants ${label.toLowerCase()} à Dakar`}
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
        emptyMessage={`Aucun restaurant ${label.toLowerCase()} disponible pour le moment. Revenez bientôt !`}
      />
    </>
  );
}

export default async function CuisinePage({ params }: Props) {
  const { slug } = await params;
  const cuisine = getCuisineContent(slug);

  // Décidé avant le <Suspense> : en streaming SSR les headers partent avec le
  // shell, un notFound() plus bas renverrait un 200 (soft-404).
  if (!cuisine) {
    notFound();
  }

  const breadcrumbs = [
    { name: 'Accueil', url: '/' },
    { name: 'Restaurants', url: '/restaurants' },
    { name: cuisine.label, url: `/restaurants/cuisine/${cuisine.slug}` },
  ];

  const otherCuisines = CUISINES_CONTENT.filter((c) => c.slug !== cuisine.slug);

  return (
    <div className="container py-6">
      <BreadcrumbJsonLd items={breadcrumbs} />

      <nav aria-label="Fil d'ariane" className="mb-4 text-sm text-muted-foreground">
        <Link href="/restaurants" className="hover:text-foreground">
          Restaurants
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{cuisine.label}</span>
      </nav>

      <header className="mb-6">
        <h1 className="text-2xl font-bold">
          <span aria-hidden="true">{cuisineEmoji(cuisine.tag)} </span>
          {cuisine.title}
        </h1>
        <p className="text-muted-foreground mt-1">{cuisine.tagline}</p>
      </header>

      <Suspense fallback={<CuisineSkeleton />}>
        <CuisineRestaurants tag={cuisine.tag} label={cuisine.label} />
      </Suspense>

      {/* Contenu éditorial placé après la liste : les restaurants restent la
          première chose vue, le texte apporte le signal SEO qui manquait. */}
      <section className="mt-10 max-w-3xl">
        <h2 className="text-xl font-semibold mb-3">
          Commander {cuisine.label.toLowerCase()} à Dakar
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          {cuisine.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
          <p>
            <Link href={ROUTES.livraisonDakar} className="text-primary hover:underline">
              Délais, tarifs et moyens de paiement : comment fonctionne la livraison à Dakar
            </Link>
          </p>
        </div>
      </section>

      {/* Maillage interne en dur : les concurrents s'appuient sur du JS pour
          relier leurs pages, ce qui les rend invisibles aux crawlers sans rendu. */}
      <section className="mt-10">
        <h2 className="text-sm font-semibold mb-3">Autres cuisines à Dakar</h2>
        <ul className="flex flex-wrap gap-2">
          {otherCuisines.map((other) => (
            <li key={other.slug}>
              <Link
                href={`/restaurants/cuisine/${other.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
              >
                <span aria-hidden="true">{cuisineEmoji(other.tag)}</span>
                {other.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
