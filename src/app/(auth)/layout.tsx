import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import { Wordmark } from '@/components/yonima/wordmark';
import { AuthBackButton } from '@/components/auth/back-button';
import { AppIconBadge } from '@/components/auth/app-icon-badge';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 p-4">
        <AuthBackButton />
        <Link href="/" aria-label={APP_NAME}>
          <Wordmark size={20} />
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AppIconBadge className="mb-6" />
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} {APP_NAME}. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
