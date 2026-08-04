import { Metadata } from 'next';
import { BreadcrumbJsonLd, FAQJsonLd } from '@/components/seo';
import { APP_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Aide & FAQ',
  description: `Questions fréquentes sur ${APP_NAME} : délais et zones de livraison, moyens de paiement (Wave, Orange Money, espèces), frais, suivi de commande et création de compte.`,
  alternates: {
    canonical: '/aide',
  },
};

const breadcrumbs = [
  { name: 'Accueil', url: '/' },
  { name: 'Aide & FAQ', url: '/aide' },
];

// Source unique : sert à la fois au rendu visible (prose H2/réponses, citable
// par les moteurs et les LLM) et au JSON-LD FAQPage.
const faq: Array<{ question: string; answer: string }> = [
  {
    question: `Quelles zones ${APP_NAME} livre-t-il ?`,
    answer:
      'Yonima livre à Dakar, au Sénégal. La disponibilité d\'un restaurant ou d\'un commerce dépend de votre adresse : renseignez-la dans l\'application pour voir les établissements qui livrent chez vous.',
  },
  {
    question: 'Quels sont les délais de livraison ?',
    answer:
      'Les délais varient selon l\'établissement et votre distance. Pour l\'épicerie Yonima, comptez généralement 10 à 15 minutes. Pour les restaurants, le délai estimé est affiché sur chaque fiche avant de commander.',
  },
  {
    question: 'Quels moyens de paiement sont acceptés ?',
    answer:
      'Vous pouvez payer par Wave, par Orange Money ou en espèces à la livraison. Aucune carte bancaire n\'est requise.',
  },
  {
    question: 'Combien coûtent les frais de livraison ?',
    answer:
      'Les frais de livraison dépendent de l\'établissement et de la distance. Le montant exact est indiqué au moment de valider votre panier, avant le paiement — sans surprise.',
  },
  {
    question: 'Y a-t-il un montant minimum de commande ?',
    answer:
      'Certains établissements appliquent un montant minimum de commande. Lorsqu\'il existe, il est affiché sur la fiche de l\'établissement et rappelé dans votre panier.',
  },
  {
    question: 'Comment suivre ma commande ?',
    answer:
      'Une fois votre commande passée, suivez son statut en temps réel depuis la rubrique « Mes commandes » : préparation, livreur en route, puis livraison.',
  },
  {
    question: 'Dois-je créer un compte pour commander ?',
    answer:
      'Oui, un compte est nécessaire pour passer commande et suivre vos livraisons. La création se fait en quelques secondes avec votre numéro de téléphone.',
  },
  {
    question: 'Comment fonctionne le programme de fidélité ?',
    answer:
      'En commandant sur Yonima, vous cumulez des avantages fidélité. Retrouvez votre solde et vos récompenses dans la rubrique « Ma fidélité » de l\'application.',
  },
  {
    question: 'Comment contacter le service client ?',
    answer:
      'Rendez-vous sur notre page Contact pour nous écrire par email ou nous appeler. Nous répondons du mieux et du plus vite possible.',
  },
];

export default function AidePage() {
  return (
    <div className="container max-w-3xl py-6 md:py-10">
      <BreadcrumbJsonLd items={breadcrumbs} />
      <FAQJsonLd questions={faq} />

      <h1 className="text-2xl md:text-3xl font-bold">Aide &amp; questions fréquentes</h1>
      <p className="mt-2 text-muted-foreground">
        Tout ce qu&apos;il faut savoir pour commander sereinement sur {APP_NAME}.
      </p>

      <div className="mt-8 space-y-8">
        {faq.map((item) => (
          <section key={item.question}>
            <h2 className="text-lg font-semibold">{item.question}</h2>
            <p className="mt-1 text-muted-foreground leading-relaxed">{item.answer}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
