import { cn, formatPrice } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg font-semibold',
};

export function PriceDisplay({
  price,
  originalPrice,
  className,
  size = 'md',
}: PriceDisplayProps) {
  const hasDiscount = originalPrice && originalPrice > price;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('font-medium', sizeClasses[size])}>
        {formatPrice(price)}
      </span>
      {hasDiscount && (
        <span className="text-sm text-muted-foreground line-through">
          {formatPrice(originalPrice)}
        </span>
      )}
    </div>
  );
}
