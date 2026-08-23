import { NextResponse } from 'next/server';
import { ANDROID_APP_URL, IOS_APP_URL, ROUTES } from '@/lib/constants';

/**
 * `/dl` — lien de téléchargement unique à coller partout (bio, QR code, SMS).
 *
 * On renvoie vers le store correspondant à l'appareil, et vers la page /app
 * (« link in bio ») quand on ne sait pas : sur desktop, envoyer quelqu'un sur
 * une fiche Play Store qu'il ne peut pas installer est un cul-de-sac, alors
 * qu'il peut commander depuis le navigateur.
 *
 * Volontairement une redirection serveur et non une page : le clic depuis une
 * bio doit atterrir dans le store sans écran intermédiaire.
 */

// Le paramètre ?src= sert à savoir quel réseau amène les installs. On ne peut
// pas l'envoyer à GA4 ici (redirection serveur, aucun JS exécuté) : on le
// propage donc au store via les paramètres de campagne que chaque store lit.
const SOURCE_MAX_LENGTH = 32;

function sanitizeSource(raw: string | null): string | null {
  if (!raw) return null;
  // Ce paramètre finit dans une URL sortante : on n'accepte qu'un slug simple
  // plutôt que de faire confiance à la query string.
  const slug = raw.toLowerCase().slice(0, SOURCE_MAX_LENGTH);
  return /^[a-z0-9_-]+$/.test(slug) ? slug : null;
}

function detectPlatform(userAgent: string): 'ios' | 'android' | 'other' {
  const ua = userAgent.toLowerCase();

  // Android d'abord : certains navigateurs Android mentent en incluant
  // « like Mac OS X » dans leur User-Agent, ce qui les ferait passer pour iOS.
  if (ua.includes('android')) return 'android';

  // iPadOS 13+ s'annonce comme un Mac de bureau ; on ne peut pas le distinguer
  // ici de manière fiable, il tombera donc sur /app — ce qui reste correct.
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';

  return 'other';
}

function withCampaign(storeUrl: string, source: string | null): string {
  if (!source) return storeUrl;

  const url = new URL(storeUrl);

  if (url.hostname.endsWith('play.google.com')) {
    // Play Console remonte `utm_source` dans les rapports d'acquisition.
    url.searchParams.set('utm_source', source);
    url.searchParams.set('utm_medium', 'social');
  } else {
    // App Store Connect utilise les jetons `pt`/`ct`/`mt` ; seul `ct`
    // (campaign token) est utilisable sans identifiant de partenaire.
    url.searchParams.set('ct', source);
  }

  return url.toString();
}

export function GET(request: Request) {
  const source = sanitizeSource(new URL(request.url).searchParams.get('src'));
  const platform = detectPlatform(request.headers.get('user-agent') ?? '');

  const target =
    platform === 'ios'
      ? withCampaign(IOS_APP_URL, source)
      : platform === 'android'
        ? withCampaign(ANDROID_APP_URL, source)
        : new URL(
            source ? `${ROUTES.app}?src=${source}` : ROUTES.app,
            request.url
          ).toString();

  // 302 et non 308 : la cible dépend de l'appareil, elle ne doit jamais être
  // mise en cache par le navigateur ni par un intermédiaire.
  const response = NextResponse.redirect(target, 302);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
