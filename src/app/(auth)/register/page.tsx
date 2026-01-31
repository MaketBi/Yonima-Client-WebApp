import { Suspense } from 'react';
import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthForm } from '@/components/auth/auth-form';
import { getCountries } from '@/actions/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { APP_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Inscription',
  description: `Créez votre compte ${APP_NAME}`,
};

interface RegisterPageProps {
  searchParams: Promise<{ phone?: string }>;
}

async function RegisterForm({ searchParams }: { searchParams: Promise<{ phone?: string }> }) {
  const countries = await getCountries();
  const params = await searchParams;

  return (
    <AuthForm
      mode="register"
      countries={countries}
      initialPhone={params.phone || ''}
    />
  );
}

function RegisterFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-12 w-full" />
      </div>
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

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Créer un compte</CardTitle>
        <CardDescription>
          Inscrivez-vous pour commander sur {APP_NAME}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<RegisterFormSkeleton />}>
          <RegisterForm searchParams={searchParams} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
