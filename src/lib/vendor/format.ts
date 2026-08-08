/**
 * Formatage propre au back-office vendeur.
 * Le client utilise `formatPrice()` (« FCFA ») ; le vendeur affiche « F CFA »
 * avec espace fine, et « F » tout court sur les écrans Statistiques.
 */

/** Entier, séparateur de milliers en espace insécable. Ex. `12 000`. */
function groupThousands(amount: number): string {
  return Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** Montant vendeur : `12 000 F CFA`. */
export function formatVendorAmount(amount: number): string {
  return `${groupThousands(amount)} F CFA`;
}

/** Montant écrans Statistiques : `12 000 F` (sans « CFA »). */
export function formatStatsAmount(amount: number): string {
  return `${groupThousands(amount)} F`;
}

/** Frais de livraison : 0 s'affiche « Gratuit ». */
export function formatDeliveryFee(amount: number): string {
  return amount <= 0 ? 'Gratuit' : formatVendorAmount(amount);
}

/** `2 articles` / `1 article`. */
export function formatItemCount(count: number): string {
  return `${count} ${count > 1 ? 'articles' : 'article'}`;
}

/** `+221 77 123 45 67` → `77 123 45 67` (affichage local sénégalais). */
export function formatVendorPhone(phone: string | null): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '').replace(/^221/, '');
  if (digits.length !== 9) return phone;
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Date de carte historique : « Aujourd'hui 14:30 », « Hier 09:12 », sinon « 06 févr. ». */
export function formatOrderListDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const time = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isSameDay(date, now)) return `Aujourd'hui ${time}`;
  if (isSameDay(date, yesterday)) return `Hier ${time}`;

  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

/** Date d'en-tête de détail : « 25 janv. 2026 à 18:30 ». */
export function formatOrderDetailDate(iso: string): string {
  const date = new Date(iso);
  const day = date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const time = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${day} à ${time}`;
}

/** Initiales sur 2 lettres, pour les avatars livreur/client. */
export function initialsOf(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
