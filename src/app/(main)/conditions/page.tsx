import { Metadata } from 'next';
import Link from 'next/link';
import { BreadcrumbJsonLd } from '@/components/seo';
import { APP_NAME, COMPANY, ROUTES } from '@/lib/constants';

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description: `Conditions générales d'utilisation du service de livraison ${APP_NAME} à Dakar.`,
  alternates: {
    canonical: '/conditions',
  },
};

const breadcrumbs = [
  { name: 'Accueil', url: '/' },
  { name: "Conditions d'utilisation", url: '/conditions' },
];

export default function ConditionsPage() {
  return (
    <div className="container max-w-3xl py-6 md:py-10">
      <BreadcrumbJsonLd items={breadcrumbs} />

      <h1 className="text-2xl md:text-3xl font-bold">Conditions générales d&apos;utilisation</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Éditeur : {COMPANY.legalName}, {COMPANY.legalForm} au capital de {COMPANY.capital},
        {' '}NINEA {COMPANY.ninea}, RCCM {COMPANY.rccm} — siège : {COMPANY.address}.
        {' '}Directeur de la publication : {COMPANY.publisher}. Hébergeur : {COMPANY.host}.
      </p>

      <div className="mt-8 space-y-8 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Objet</h2>
          <p className="text-muted-foreground">
            Les présentes conditions générales d&apos;utilisation (les « CGU ») régissent l&apos;accès
            et l&apos;utilisation du service {APP_NAME}, plateforme de mise en relation permettant de
            commander auprès de restaurants, commerces et épiceries partenaires à Dakar, et de se
            faire livrer.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Compte utilisateur</h2>
          <p className="text-muted-foreground">
            La création d&apos;un compte est nécessaire pour passer commande. Vous vous engagez à
            fournir des informations exactes et à préserver la confidentialité de vos identifiants.
            Vous êtes responsable des commandes passées depuis votre compte.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Commandes et paiement</h2>
          <p className="text-muted-foreground">
            Le prix des produits, les frais de livraison et l&apos;éventuel montant minimum de
            commande sont affichés avant validation du panier. Le paiement s&apos;effectue par Wave,
            Orange Money ou en espèces à la livraison. Une commande validée vaut engagement de paiement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Livraison</h2>
          <p className="text-muted-foreground">
            Les délais de livraison sont donnés à titre indicatif et peuvent varier selon
            l&apos;établissement, la distance et les conditions de circulation. {APP_NAME} met tout en
            œuvre pour respecter les délais annoncés.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Responsabilité</h2>
          <p className="text-muted-foreground">
            {APP_NAME} agit en tant qu&apos;intermédiaire entre vous et les établissements
            partenaires. La qualité et la conformité des produits relèvent de la responsabilité des
            établissements. {APP_NAME} ne saurait être tenu responsable des cas de force majeure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Données personnelles</h2>
          <p className="text-muted-foreground">
            Le traitement de vos données personnelles est décrit dans notre{' '}
            <Link href={ROUTES.confidentialite} className="text-primary hover:underline">
              politique de confidentialité
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Contact</h2>
          <p className="text-muted-foreground">
            Pour toute question relative aux présentes CGU, contactez-nous via la{' '}
            <Link href={ROUTES.contact} className="text-primary hover:underline">
              page Contact
            </Link>
            .
          </p>
        </section>

        <p className="text-xs text-muted-foreground border-t pt-6">
          Document informatif à faire valider juridiquement avant publication définitive.
        </p>
      </div>
    </div>
  );
}
