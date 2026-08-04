import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const chipVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-pill text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-electric disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      tone: {
        // Bordered neutral capsule (quick filters)
        neutral: "border border-border bg-white text-ink hover:bg-neutral-100",
        // Filled quiet capsule (recent searches, category tabs inactive)
        quiet: "bg-neutral-100 text-ink hover:brightness-95",
      },
      selected: {
        true: "bg-green-forest text-white border-transparent hover:bg-green-deep",
        false: "",
      },
    },
    defaultVariants: {
      tone: "neutral",
      selected: false,
    },
  }
);

export interface ChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {
  asChild?: boolean;
}

/** Yonima capsule: quick filters, category tabs, recent-search pills. */
export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, tone, selected, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(chipVariants({ tone, selected }), "px-4 py-2", className)}
        {...props}
      />
    );
  }
);
Chip.displayName = "Chip";
