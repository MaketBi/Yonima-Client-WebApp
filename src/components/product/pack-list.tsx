'use client';

import { PackCard } from './pack-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Package } from 'lucide-react';
import type { Pack } from '@/types/models';

interface PackListProps {
  packs: Pack[];
  vendorId: string;
  emptyMessage?: string;
}

export function PackList({ packs, vendorId, emptyMessage }: PackListProps) {
  if (packs.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Aucun pack"
        description={emptyMessage || 'Aucun pack disponible pour le moment.'}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {packs.map((pack) => (
        <PackCard key={pack.id} pack={pack} vendorId={vendorId} />
      ))}
    </div>
  );
}
