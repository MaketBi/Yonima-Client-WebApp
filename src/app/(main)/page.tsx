import Link from 'next/link';
import { ChevronRight, MapPin, Clock, Star, Utensils, ShoppingBag, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ROUTES, APP_NAME } from '@/lib/constants';

// Placeholder data - will be replaced with real data from Supabase
const featuredCategories = [
  {
    id: 'restaurants',
    name: 'Restaurants',
    icon: Utensils,
    href: ROUTES.restaurants,
    color: 'bg-orange-100 text-orange-600',
  },
  {
    id: 'commerces',
    name: 'Commerces',
    icon: Store,
    href: ROUTES.commerces,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'epicerie',
    name: 'Épicerie',
    icon: ShoppingBag,
    href: ROUTES.epicerie,
    color: 'bg-green-100 text-green-600',
  },
];

export default function HomePage() {
  return (
    <div className="container py-6 space-y-8">
      {/* Hero Section */}
      <section className="relative rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-8 md:p-12">
        <div className="max-w-xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Bienvenue sur {APP_NAME}
          </h1>
          <p className="text-lg opacity-90 mb-6">
            Commandez vos repas et courses préférés et faites-vous livrer rapidement à Dakar.
          </p>
          <div className="flex items-center gap-2 text-sm opacity-80">
            <MapPin className="h-4 w-4" />
            <span>Livraison dans tout Dakar</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Catégories</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {featuredCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Link key={category.id} href={category.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className={`rounded-full p-3 mb-3 ${category.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-center">
                      {category.name}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Restaurants */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Restaurants populaires</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href={ROUTES.restaurants}>
              Voir tout
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Placeholder cards - will be replaced with real data */}
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-muted" />
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">Restaurant {i}</h3>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    4.5
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Cuisine sénégalaise traditionnelle
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    20-30 min
                  </span>
                  <span>1 000 FCFA livraison</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Packs */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Packs du moment</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/packs">
              Voir tout
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Placeholder cards - will be replaced with real data */}
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square bg-muted" />
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1">Pack Famille {i}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Idéal pour 4 personnes
                </p>
                <p className="font-semibold text-primary">15 000 FCFA</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="rounded-2xl bg-muted p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">
          Téléchargez notre application
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Profitez d&apos;une meilleure expérience avec notre application mobile et recevez des notifications en temps réel.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild>
            <a
              href={process.env.NEXT_PUBLIC_IOS_APP_URL || '#'}
              target="_blank"
              rel="noopener noreferrer"
            >
              App Store
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a
              href={process.env.NEXT_PUBLIC_ANDROID_APP_URL || '#'}
              target="_blank"
              rel="noopener noreferrer"
            >
              Play Store
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
