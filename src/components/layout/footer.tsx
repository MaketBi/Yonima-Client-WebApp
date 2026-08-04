import Link from 'next/link';
import { APP_NAME, ROUTES, LEGAL_URLS, IOS_APP_URL, ANDROID_APP_URL } from '@/lib/constants';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-xl font-bold text-primary">
              {APP_NAME}
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Livraison rapide à Dakar. Restaurants, commerces et épicerie à portée de main.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold mb-3">Navigation</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href={ROUTES.restaurants} className="hover:text-primary transition-colors">
                  Restaurants
                </Link>
              </li>
              <li>
                <Link href={ROUTES.commerces} className="hover:text-primary transition-colors">
                  Commerces
                </Link>
              </li>
              <li>
                <Link href={ROUTES.epicerie} className="hover:text-primary transition-colors">
                  Épicerie
                </Link>
              </li>
              <li>
                <Link href={ROUTES.apropos} className="hover:text-primary transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <a href={LEGAL_URLS.support} className="hover:text-primary transition-colors">
                  Aide &amp; support
                </a>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold mb-3">Mon compte</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href={ROUTES.commandes} className="hover:text-primary transition-colors">
                  Mes commandes
                </Link>
              </li>
              <li>
                <Link href={ROUTES.fidelite} className="hover:text-primary transition-colors">
                  Ma fidélité
                </Link>
              </li>
              <li>
                <Link href={ROUTES.profil} className="hover:text-primary transition-colors">
                  Mon profil
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-3">Légal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href={LEGAL_URLS.terms} className="hover:text-primary transition-colors">
                  Conditions d&apos;utilisation
                </a>
              </li>
              <li>
                <a href={LEGAL_URLS.privacy} className="hover:text-primary transition-colors">
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a href={LEGAL_URLS.mentionsLegales} className="hover:text-primary transition-colors">
                  Mentions légales
                </a>
              </li>
              <li>
                <a href={LEGAL_URLS.contact} className="hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} {APP_NAME}. Tous droits réservés.
          </p>
          <div className="flex items-center space-x-4">
            <Link
              href={IOS_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              App Store
            </Link>
            <Link
              href={ANDROID_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Play Store
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
