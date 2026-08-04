"use client";

import { Plus, Minus } from "lucide-react";
import { SafeImage } from "@/components/shared/safe-image";
import { cn, formatPrice } from "@/lib/utils";

interface ProductCardProps {
  name: string;
  price: number;
  imageUrl?: string | null;
  /** Current quantity in cart; 0 → shows the round "+" add button. */
  quantity?: number;
  /** Disabled when the vendor is closed; tap surfaces a "fermé" overlay upstream. */
  disabled?: boolean;
  onAdd?: () => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onOpen?: () => void;
  className?: string;
}

/**
 * Yonima product card (DS "ProductCard"): square image, name on two lines,
 * green bold price, and a round "+" that becomes a "− N +" stepper once the
 * item is in the cart. Presentational — cart wiring is passed in via callbacks.
 */
export function ProductCard({
  name,
  price,
  imageUrl,
  quantity = 0,
  disabled = false,
  onAdd,
  onIncrement,
  onDecrement,
  onOpen,
  className,
}: ProductCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border border-border bg-white",
        className
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        className="relative aspect-square bg-bg-warm text-left"
        aria-label={name}
      >
        <SafeImage
          src={imageUrl || ""}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 45vw, 220px"
          fallback={<span className="text-3xl">🍽️</span>}
          fallbackClassName="absolute inset-0 bg-bg-warm"
        />
      </button>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <button
          type="button"
          onClick={onOpen}
          className="text-left text-[15px] font-semibold leading-snug line-clamp-2"
        >
          {name}
        </button>

        <div className="mt-auto flex flex-col gap-2">
          <div className="text-base font-bold text-green-forest">
            {formatPrice(price)}
          </div>

          {quantity > 0 ? (
            <div className="flex h-8 items-center justify-between rounded-pill bg-green-forest px-3 text-sm font-bold text-white">
              <button
                type="button"
                onClick={onDecrement}
                aria-label="Retirer un"
                className="grid h-6 w-6 place-items-center"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={onIncrement}
                aria-label="Ajouter un"
                className="grid h-6 w-6 place-items-center"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onAdd}
              disabled={disabled}
              aria-label={`Ajouter ${name}`}
              className={cn(
                "grid h-8 w-8 place-items-center self-end rounded-pill bg-green-forest text-white transition-colors hover:bg-green-deep",
                disabled && "bg-neutral-200 text-neutral-500"
              )}
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
