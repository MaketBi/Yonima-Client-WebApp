import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCountries } from '@/actions/auth';
import { getVendorSession } from '@/actions/vendor-auth';
import { VendorLoginForm } from '@/components/vendor/vendor-login-form';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';

export const metadata: Metadata = {
  title: 'Espace Vendeur',
  description: 'Connectez-vous à votre espace vendeur Yonima Business',
  robots: { index: false, follow: false },
};

export default async function VendeurConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: redirectParam } = await searchParams;

  // Un vendeur déjà connecté n'a rien à faire ici.
  const session = await getVendorSession();
  if (session.ok) {
    redirect(redirectParam || VENDOR_ROUTES.commandes);
  }

  const countries = await getCountries();

  // On ne redirige que vers des routes internes, jamais vers une URL absolue.
  const safeRedirect =
    redirectParam?.startsWith('/vendeur') && !redirectParam.startsWith('//')
      ? redirectParam
      : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-5 py-16">
      <VendorLoginForm countries={countries} redirectTo={safeRedirect} />
    </main>
  );
}
