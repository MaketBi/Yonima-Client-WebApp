import { Suspense } from 'react';
import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthForm } from '@/components/auth/auth-form';
import { getCountries } from '@/actions/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { APP_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Connexion',
  description: `Connectez-vous à votre compte ${APP_NAME}`,
};

interface LoginPageProps {
  searchParams: Promise<{ phone?: string; redirect?: string }>;
}

async function LoginForm({ searchParams }: { searchParams: Promise<{ phone?: string }> }) {
  const countries = await getCountries();
  const params = await searchParams;

  return (
    <AuthForm
      mode="login"
      countries={countries}
      initialPhone={params.phone || ''}
    />
  );
}

function LoginFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-12 w-24" />
          <Skeleton className="h-12 flex-1" />
        </div>
      </div>
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Connexion</CardTitle>
        <CardDescription>
          Entrez votre numéro de téléphone pour vous connecter
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm searchParams={searchParams} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
