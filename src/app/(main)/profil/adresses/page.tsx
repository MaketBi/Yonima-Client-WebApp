import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/auth';
import { getUserAddresses } from '@/actions/addresses';
import { AddressesManager } from '@/components/profile/addresses-manager';

export const metadata: Metadata = {
  title: 'Mes adresses',
  description: 'Gérez vos adresses de livraison',
};

export default async function AddressesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?redirect=/profil/adresses');
  }

  const addresses = await getUserAddresses();

  return <AddressesManager initialAddresses={addresses} />;
}
