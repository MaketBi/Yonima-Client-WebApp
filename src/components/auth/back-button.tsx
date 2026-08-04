'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { IconButton } from '@/components/yonima/icon-button';

/**
 * Back control for the auth screens. Goes back in history when possible,
 * otherwise falls back to the home page.
 */
export function AuthBackButton() {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  return (
    <IconButton
      variant="outline"
      size={38}
      aria-label="Retour"
      onClick={handleBack}
    >
      <ChevronLeft className="h-5 w-5" />
    </IconButton>
  );
}
