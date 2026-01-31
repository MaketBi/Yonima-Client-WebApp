'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ShoppingCart, User, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useCartItemCount } from '@/stores/cart-store';
import { APP_NAME, ROUTES } from '@/lib/constants';

const navLinks = [
  { href: ROUTES.home, label: 'Accueil' },
  { href: ROUTES.restaurants, label: 'Restaurants' },
  { href: ROUTES.commerces, label: 'Commerces' },
  { href: ROUTES.epicerie, label: 'Épicerie' },
];

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();
  const cartItemCount = useCartItemCount();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">{APP_NAME}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === link.href
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Search */}
          <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
            <Link href="/search">
              <Search className="h-5 w-5" />
              <span className="sr-only">Rechercher</span>
            </Link>
          </Button>

          {/* Notifications */}
          {mounted && isAuthenticated && (
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href={ROUTES.notifications}>
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Link>
            </Button>
          )}

          {/* Cart */}
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href={ROUTES.panier}>
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </Badge>
              )}
              <span className="sr-only">Panier</span>
            </Link>
          </Button>

          {/* Profile / Login - Show based on auth state */}
          {mounted && (
            isAuthenticated ? (
              <Link href={ROUTES.profil}>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Profil</span>
                </Button>
              </Link>
            ) : !isLoading ? (
              <Link href={ROUTES.login} className="hidden sm:block">
                <Button variant="default" size="sm">
                  Connexion
                </Button>
              </Link>
            ) : (
              // Show placeholder while loading (only if not authenticated)
              <div className="w-9 h-9" />
            )
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'text-lg font-medium transition-colors hover:text-primary',
                      pathname === link.href
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <hr className="my-4" />
                {mounted && isAuthenticated ? (
                  <>
                    <Link
                      href={ROUTES.commandes}
                      className="text-lg font-medium text-muted-foreground hover:text-primary"
                    >
                      Mes commandes
                    </Link>
                    <Link
                      href={ROUTES.fidelite}
                      className="text-lg font-medium text-muted-foreground hover:text-primary"
                    >
                      Ma fidélité
                    </Link>
                    <Link
                      href={ROUTES.profil}
                      className="text-lg font-medium text-muted-foreground hover:text-primary"
                    >
                      Mon profil
                    </Link>
                  </>
                ) : (
                  <Link
                    href={ROUTES.login}
                    className="text-lg font-medium text-primary"
                  >
                    Connexion
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
