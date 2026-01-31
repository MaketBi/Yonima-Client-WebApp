'use client';

import Link from 'next/link';
import { CheckCircle2, Home, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Success Icon */}
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-2">
          Commande confirmée !
        </h1>

        {/* Subtitle */}
        <p className="text-muted-foreground text-center max-w-sm mb-8">
          Votre commande a été reçue et est en cours de préparation. Vous recevrez une notification lorsque le livreur sera en route.
        </p>

        {/* Order Number Placeholder */}
        <div className="bg-white rounded-xl p-4 mb-8 text-center shadow-sm">
          <p className="text-sm text-muted-foreground mb-1">Numéro de commande</p>
          <p className="text-xl font-mono font-bold text-primary">#YON-{Date.now().toString().slice(-6)}</p>
        </div>

        {/* Buttons */}
        <div className="w-full max-w-sm space-y-3">
          <Button className="w-full h-12" asChild>
            <Link href={ROUTES.commandes}>
              <FileText className="h-5 w-5 mr-2" />
              Voir mes commandes
            </Link>
          </Button>

          <Button variant="outline" className="w-full h-12" asChild>
            <Link href={ROUTES.home}>
              <Home className="h-5 w-5 mr-2" />
              Retour à l'accueil
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-primary/5 p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Besoin d'aide ? Contactez-nous sur WhatsApp
        </p>
      </div>
    </div>
  );
}
