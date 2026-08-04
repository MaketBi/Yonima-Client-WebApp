import { Metadata } from 'next';
import Link from 'next/link';
import { BreadcrumbJsonLd } from '@/components/seo';
import { APP_NAME, COMPANY, ROUTES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: `Comment ${APP_NAME} collecte, utilise et protège vos données personnelles.`,
  alternates: {
    canonical: '/confidentialite',
  },
};

const breadcrumbs = [
  { name: 'Accueil', url: '/' },
  { name: 'Politique de confidentialité', url: '/confidentialite' },
];

export default function ConfidentialitePage() {
  return (
    <div className="container max-w-3xl py-6 md:py-10">
      <BreadcrumbJsonLd items={breadcrumbs} />

      <h1 className="text-2xl md:text-3xl font-bold">Politique de confidentialité</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Responsable du traitement : {COMPANY.legalName}, {COMPANY.address}.
      </p>

      <div className="mt-8 space-y-8 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Données que nous collectons</h2>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Identité et contact : nom, numéro de téléphone, adresse email.</li>
            <li>Adresses de livraison et données de géolocalisation nécessaires au service.</li>
            <li>Historique de commandes et préférences.</li>
            <li>Données techniques (appareil, logs) pour la sécurité et le bon fonctionnement.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Finalités du traitement</h2>
          <p className="text-muted-foreground">
            Vos données servent à traiter et livrer vos commandes, à gérer votre compte et votre
            fidélité, à assurer le support client, à sécuriser le service et à l&apos;améliorer.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Paiement</h2>
          <p className="text-muted-foreground">
            Les paiements par Wave et Orange Money sont traités par les prestataires concernés.
            {APP_NAME} ne stocke pas vos identifiants de paiement mobile ni de données de carte
            bancaire.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Partage des données</h2>
          <p className="text-muted-foreground">
            Certaines données (nom, téléphone, adresse) sont partagées avec les établissements
            partenaires et les livreurs dans la stricte mesure nécessaire à l&apos;exécution de votre
            commande. Nous ne vendons pas vos données personnelles.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Conservation</h2>
          <p className="text-muted-foreground">
            Vos données sont conservées pendant la durée nécessaire aux finalités décrites et aux
            obligations légales applicables, puis supprimées ou anonymisées.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Vos droits</h2>
          <p className="text-muted-foreground">
            Vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et
            d&apos;opposition sur vos données. Pour l&apos;exercer, écrivez-nous à{' '}
            <a href={`mailto:${COMPANY.email}`} className="text-primary hover:underline break-all">
              {COMPANY.email}
            </a>{' '}
            (objet «&nbsp;Données personnelles&nbsp;») ou via la{' '}
            <Link href={ROUTES.contact} className="text-primary hover:underline">
              page Contact
            </Link>
            . Vous pouvez également introduire une réclamation auprès de la{' '}
            {COMPANY.dataProtectionAuthority}.
          </p>
        </section>

        <p className="text-xs text-muted-foreground border-t pt-6">
          Document informatif à faire valider juridiquement avant publication définitive.
        </p>
      </div>
    </div>
  );
}
