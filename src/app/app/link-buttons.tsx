'use client';

import { useSearchParams } from 'next/navigation';
import { trackEvent } from '@/components/analytics';

/**
 * Boutons de la page /app. Client uniquement pour deux raisons :
 * lire `?src=` (le réseau d'où vient le clic) et envoyer l'événement GA4.
 */

type LinkButtonProps = {
  href: string;
  /** Identifiant stable envoyé à GA4 — ne pas renommer sans refaire les rapports. */
  eventLabel: string;
  icon: React.ReactNode;
  label: string;
  hint?: string;
  variant?: 'primary' | 'default';
};

export function LinkButton({
  href,
  eventLabel,
  icon,
  label,
  hint,
  variant = 'default',
}: LinkButtonProps) {
  const searchParams = useSearchParams();
  const source = searchParams.get('src');

  const isPrimary = variant === 'primary';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        // `bio_link_click` regroupe tous les clics de cette page : le rapport se
        // lit ensuite en croisant `link` (quel bouton) et `source` (quel réseau).
        trackEvent('bio_link_click', {
          link: eventLabel,
          source: source ?? 'direct',
        })
      }
      className={[
        'flex items-center gap-3 rounded-[var(--radius-lg)] border px-4 py-3.5',
        'transition-colors active:scale-[0.99] motion-safe:transition-transform',
        isPrimary
          ? 'border-transparent bg-primary text-primary-foreground hover:bg-primary/90'
          : 'border-border bg-card text-card-foreground hover:bg-muted',
      ].join(' ')}
    >
      <span
        className={[
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          isPrimary ? 'bg-white/15' : 'bg-muted',
        ].join(' ')}
        aria-hidden="true"
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold leading-tight">
          {label}
        </span>
        {hint ? (
          <span
            className={[
              'block text-[13px] leading-tight',
              isPrimary ? 'text-primary-foreground/80' : 'text-muted-foreground',
            ].join(' ')}
          >
            {hint}
          </span>
        ) : null}
      </span>

      <svg
        className={[
          'h-4 w-4 shrink-0',
          isPrimary ? 'text-primary-foreground/70' : 'text-muted-foreground',
        ].join(' ')}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </a>
  );
}
