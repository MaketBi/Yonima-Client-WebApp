'use client';

import { EstablishmentCard } from './establishment-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Store } from 'lucide-react';
import type { Vendor, VendorType } from '@/types/models';

interface EstablishmentListProps {
  establishments: Vendor[];
  type: VendorType;
  emptyMessage?: string;
}

const typeRoutes: Record<VendorType, string> = {
  restaurant: '/restaurants',
  store: '/commerces',
  grocery: '/epicerie',
  legacy: '/commerces',
};

export function EstablishmentList({ establishments, type, emptyMessage }: EstablishmentListProps) {
  if (establishments.length === 0) {
    return (
      <EmptyState
        icon={Store}
        title="Aucun établissement"
        description={emptyMessage || "Aucun établissement disponible pour le moment."}
      />
    );
  }

  const baseRoute = typeRoutes[type];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {establishments.map((establishment) => (
        <EstablishmentCard
          key={establishment.id}
          establishment={establishment}
          href={`${baseRoute}/${establishment.slug || establishment.id}`}
        />
      ))}
    </div>
  );
}
