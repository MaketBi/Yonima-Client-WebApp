import { redirect } from 'next/navigation';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';

/** `/vendeur` n'a pas d'écran propre : Commandes est l'accueil du back-office. */
export default function VendeurIndexPage() {
  redirect(VENDOR_ROUTES.commandes);
}
