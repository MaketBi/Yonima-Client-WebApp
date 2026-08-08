import type { Metadata } from 'next';
import { getVendorSession } from '@/actions/vendor-auth';
import { fetchVendorAssistants } from '@/actions/vendor-assistants';
import { AssistantsView } from '@/components/vendor/assistants/assistants-view';

export const metadata: Metadata = { title: 'Assistants' };
export const dynamic = 'force-dynamic';

export default async function VendeurAssistantsPage() {
  const session = await getVendorSession();
  if (!session.ok) return null;

  const { assistants, error } = await fetchVendorAssistants();

  return (
    <AssistantsView
      assistants={assistants}
      canManage={session.session.isOwner}
      loadError={error}
    />
  );
}
