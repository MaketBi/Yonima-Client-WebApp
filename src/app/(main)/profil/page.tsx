import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/auth';
import { ProfileContent } from '@/components/profile/profile-content';

export const metadata: Metadata = {
  title: 'Mon Profil',
  description: 'Gérez votre profil et vos paramètres',
};

export default async function ProfilPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?redirect=/profil');
  }

  return <ProfileContent user={user} />;
}
