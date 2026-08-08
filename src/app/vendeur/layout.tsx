import type { Metadata } from 'next';
import { VENDOR_APP_NAME } from '@/lib/vendor/constants';

export const metadata: Metadata = {
  title: {
    default: VENDOR_APP_NAME,
    template: `%s · ${VENDOR_APP_NAME}`,
  },
  // Back-office : jamais indexé.
  robots: { index: false, follow: false },
};

/**
 * Layout racine des routes vendeur.
 *
 * Volontairement nu : la page de connexion n'a pas de shell, et le contrôle
 * d'accès vit dans `(dashboard)/layout.tsx` — ce qui évite de charger la
 * session vendeur sur `/vendeur/connexion`.
 */
export default function VendeurLayout({ children }: { children: React.ReactNode }) {
  return children;
}
