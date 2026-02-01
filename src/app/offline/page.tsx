import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "Hors ligne",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <WifiOff className="h-10 w-10 text-muted-foreground" />
      </div>

      <h1 className="mb-2 text-2xl font-bold">Vous êtes hors ligne</h1>

      <p className="mb-6 max-w-sm text-muted-foreground">
        Impossible de se connecter à Internet. Vérifiez votre connexion et réessayez.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="outline">
          <Link href="/">
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
          </Link>
        </Button>
      </div>

      <div className="mt-8 rounded-lg border bg-card p-4 text-left">
        <h2 className="mb-2 font-semibold">Conseils</h2>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>Vérifiez que le Wi-Fi ou les données mobiles sont activés</li>
          <li>Essayez de vous rapprocher de votre routeur</li>
          <li>Redémarrez votre connexion Internet</li>
        </ul>
      </div>
    </div>
  );
}
