import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/auth';
import { EditProfileForm } from '@/components/profile/edit-profile-form';

export const metadata: Metadata = {
  title: 'Modifier le profil',
  description: 'Modifiez vos informations personnelles',
};

export default async function EditProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?redirect=/profil/modifier');
  }

  return <EditProfileForm user={user} />;
}
