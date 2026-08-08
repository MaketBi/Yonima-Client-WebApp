import { cn } from '@/lib/utils';
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from '@/types/vendor';

/** Capsule de statut : texte plein sur fond à 12 % de la même teinte. */
export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  const color = ORDER_STATUS_COLORS[status] ?? '#7A7A7A';
  const label = ORDER_STATUS_LABELS[status] ?? status;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill px-2.5 py-1 text-[12px] font-semibold',
        className
      )}
      style={{ color, backgroundColor: `${color}1F` }}
    >
      {label}
    </span>
  );
}
