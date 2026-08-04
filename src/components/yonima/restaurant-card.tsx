import Link from "next/link";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SafeImage } from "@/components/shared/safe-image";
import { cn, formatPrice, isVendorOpen } from "@/lib/utils";
import type { Vendor } from "@/types/models";

interface RestaurantCardProps {
  vendor: Vendor;
  href: string;
  /** Show the SPONSORISÉ badge (featured/sponsored placement). */
  sponsored?: boolean;
  /** Prioritise the cover image (above-the-fold, first card). */
  priority?: boolean;
  className?: string;
}

/**
 * Yonima restaurant listing card (DS "RestaurantCard"): wide cover image,
 * name, cuisine subtitle from tags, and an "ETA · fee" row with the fee in
 * bold green when free. Closed vendors get a dimmed cover + "Fermé" badge.
 */
export function RestaurantCard({
  vendor,
  href,
  sponsored = false,
  priority = false,
  className,
}: RestaurantCardProps) {
  const isOpen = vendor.is_open && isVendorOpen(vendor.opening_hours);
  const cuisine = vendor.tags?.slice(0, 2).join(" · ");
  const free = vendor.delivery_fee <= 0;

  return (
    <Link
      href={href}
      className={cn(
        "block overflow-hidden rounded-lg border border-border bg-white shadow-card transition-shadow hover:shadow-raised",
        className
      )}
    >
      <div className="relative aspect-[2.4/1] bg-neutral-200">
        <SafeImage
          src={vendor.cover_image_url || ""}
          alt={vendor.name}
          fill
          className={cn("object-cover", !isOpen && "opacity-60")}
          sizes="(max-width: 768px) 100vw, 400px"
          priority={priority}
          fallback={<span className="text-4xl">🍽️</span>}
          fallbackClassName="absolute inset-0 bg-bg-warm"
        />
        {sponsored && (
          <Badge
            variant="soft"
            className="absolute left-3 top-3 px-2.5 py-1 text-[10px] tracking-wide"
          >
            SPONSORISÉ
          </Badge>
        )}
        {!isOpen && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Badge variant="destructive">Fermé</Badge>
          </div>
        )}
      </div>

      <div className="p-3.5">
        <h3 className="text-[15px] font-semibold leading-tight line-clamp-1">
          {vendor.name}
        </h3>
        {cuisine && (
          <p className="mt-0.5 text-xs text-ink-muted line-clamp-1">{cuisine}</p>
        )}
        <div className="mt-2 flex items-center gap-2 text-[13px] text-ink-muted">
          {vendor.estimated_time && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {vendor.estimated_time}
            </span>
          )}
          <span aria-hidden="true">·</span>
          <span className={cn(free && "font-semibold text-green-forest")}>
            {free ? "Livraison gratuite" : `Livraison ${formatPrice(vendor.delivery_fee)}`}
          </span>
        </div>
      </div>
    </Link>
  );
}
