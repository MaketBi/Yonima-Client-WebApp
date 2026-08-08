import Link from 'next/link';
import { AlertTriangle, ArrowLeft, Clock, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VendorWordmark } from './vendor-wordmark';
import { ROUTES } from '@/lib/constants';
import {
  VENDOR_SUPPORT_PHONE,
  VENDOR_SUPPORT_WHATSAPP_MESSAGE,
} from '@/lib/vendor/constants';
import type { VendorAccessDenial } from '@/types/vendor';

const CONTENT: Record<
  Exclude<VendorAccessDenial, 'not_authenticated'>,
  { icon: 'store' | 'clock' | 'alert'; title: string; body: string; showSupport: boolean }
> = {
  not_a_vendor: {
    icon: 'store',
    title: 'Espace réservé aux vendeurs',
    body: "Ce compte n'est pas enregistré comme vendeur Yonima Business. Si vous gérez un commerce et souhaitez y accéder, contactez-nous.",
    showSupport: true,
  },
  assistant_not_supported: {
    icon: 'clock',
    title: 'Bientôt disponible',
    body: "L'espace vendeur web est pour l'instant réservé aux administrateurs de boutique. En tant qu'assistant, continuez à utiliser l'application mobile Yonima Business.",
    showSupport: false,
  },
  assistant_deactivated: {
    icon: 'alert',
    title: 'Compte désactivé',
    body: "Votre compte assistant a été désactivé par l'administrateur de la boutique. Rapprochez-vous de lui pour le réactiver.",
    showSupport: false,
  },
  no_vendor_linked: {
    icon: 'alert',
    title: 'Compte non rattaché',
    body: "Votre compte est bien reconnu comme vendeur, mais aucune boutique n'y est rattachée. Notre équipe doit finaliser la configuration — contactez le support pour la débloquer.",
    showSupport: true,
  },
};

const ICONS = { store: Store, clock: Clock, alert: AlertTriangle };

export function VendorAccessDenied({
  reason,
}: {
  reason: Exclude<VendorAccessDenial, 'not_authenticated'>;
}) {
  const content = CONTENT[reason];
  const Icon = ICONS[content.icon];

  const supportHref = `https://wa.me/${VENDOR_SUPPORT_PHONE.replace(
    /\D/g,
    ''
  )}?text=${encodeURIComponent(VENDOR_SUPPORT_WHATSAPP_MESSAGE)}`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-5 py-16">
      <div className="w-full max-w-[440px] text-center">
        <VendorWordmark className="mb-10 inline-block text-[28px]" />

        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
          <Icon className="h-7 w-7 text-green-forest" aria-hidden="true" />
        </div>

        <h1 className="mb-3 text-[22px] font-bold tracking-[-0.03em]">{content.title}</h1>
        <p className="mb-8 text-[15px] leading-relaxed text-ink-muted">{content.body}</p>

        <div className="flex flex-col gap-3">
          {content.showSupport && (
            <Button asChild className="h-12 w-full rounded-xl">
              <a href={supportHref} target="_blank" rel="noopener noreferrer">
                Contacter le support
              </a>
            </Button>
          )}
          <Button asChild variant="outline" className="h-12 w-full rounded-xl">
            <Link href={ROUTES.home}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la boutique
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
