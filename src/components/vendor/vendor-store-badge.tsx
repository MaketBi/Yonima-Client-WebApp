import { cn } from '@/lib/utils';
import type { Vendor } from '@/types/models';

/** Initiales de la boutique — 2 lettres max, comme le « BK » du design. */
export function storeInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Logo (ou initiales) + nom + pastille Ouvert/Fermé — en-tête de la sidebar. */
export function VendorStoreBadge({
  vendor,
  className,
}: {
  vendor: Vendor;
  className?: string;
}) {
  const isOpen = vendor.is_open !== false;

  return (
    <div className={cn('flex items-center gap-[11px]', className)}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-green-forest text-[15px] font-bold tracking-tight text-white">
        {vendor.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vendor.logo_url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          storeInitials(vendor.name)
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate text-[14.5px] font-bold tracking-[-0.02em]">
          {vendor.name}
        </p>
        <p
          className={cn(
            'flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em]',
            isOpen ? 'text-green-deep' : 'text-ink-muted'
          )}
        >
          <span
            className={cn(
              'h-[7px] w-[7px] rounded-full',
              isOpen ? 'bg-green-electric' : 'bg-neutral-500'
            )}
          />
          {isOpen ? 'Ouvert' : 'Fermé'}
        </p>
      </div>
    </div>
  );
}
