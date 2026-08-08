import { cn } from '@/lib/utils';

interface VendorWordmarkProps {
  /** Ton : `ink` sur fond clair, `inverse` sur fond vert. */
  tone?: 'ink' | 'inverse';
  className?: string;
}

/**
 * Wordmark « yonimabusiness » du back-office vendeur.
 * Toujours en minuscules, en un seul mot, « business » en vert forêt
 * (blanc en `inverse`) — c'est le lockup du design.
 */
export function VendorWordmark({ tone = 'ink', className }: VendorWordmarkProps) {
  return (
    <span
      className={cn(
        'select-none font-bold leading-none',
        tone === 'inverse' ? 'text-white' : 'text-ink',
        className
      )}
      style={{ letterSpacing: '-0.05em' }}
    >
      yonima
      <span className={tone === 'inverse' ? 'text-white/80' : 'text-green-forest'}>
        business
      </span>
    </span>
  );
}
