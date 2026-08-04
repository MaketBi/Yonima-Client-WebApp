import Image from 'next/image';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';

/**
 * Yonima app icon shown on the auth screens, framed in a white rounded card
 * (matches the mobile app's login/register header).
 */
export function AppIconBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'mx-auto grid h-24 w-24 place-items-center rounded-2xl bg-white shadow-card',
        className
      )}
    >
      <Image
        src="/yonima-app-icon.svg"
        alt={APP_NAME}
        width={72}
        height={72}
        className="h-[72px] w-[72px] object-contain"
        priority
      />
    </div>
  );
}
