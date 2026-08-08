'use client';

import {
  Banknote,
  BarChart3,
  Bike,
  ClipboardList,
  Clock,
  Package,
  ShoppingBag,
  Star,
  User,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

/**
 * Icônes de navigation vendeur. Le design fournit les SVG Lucide ;
 * on passe par `lucide-react`, déjà utilisé partout dans la webapp,
 * plutôt que de dupliquer 40 fichiers.
 */
const ICONS: Record<string, LucideIcon> = {
  Banknote,
  BarChart3,
  Bike,
  ClipboardList,
  Clock,
  Package,
  ShoppingBag,
  Star,
  User,
  Users,
  Wallet,
};

export function VendorNavIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? ClipboardList;
  return <Icon className={className} aria-hidden="true" />;
}
