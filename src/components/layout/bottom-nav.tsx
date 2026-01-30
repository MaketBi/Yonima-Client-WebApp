'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid3X3, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useCartItemCount } from '@/stores/cart-store';
import { ROUTES } from '@/lib/constants';

const navItems = [
  {
    href: ROUTES.home,
    label: 'Accueil',
    icon: Home,
  },
  {
    href: ROUTES.epicerie,
    label: 'Catégories',
    icon: Grid3X3,
  },
  {
    href: ROUTES.panier,
    label: 'Panier',
    icon: ShoppingCart,
    showBadge: true,
  },
  {
    href: ROUTES.profil,
    label: 'Profil',
    icon: User,
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const cartItemCount = useCartItemCount();

  // Hide on certain pages
  const hiddenPaths = ['/login', '/register', '/checkout'];
  if (hiddenPaths.some((path) => pathname.startsWith(path))) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full relative transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.showBadge && cartItemCount > 0 && (
                  <Badge
                    className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
                  >
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </Badge>
                )}
              </div>
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
