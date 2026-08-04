import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-pill shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-electric disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        outline: "border border-border bg-white text-ink hover:bg-neutral-100",
        // Frosted button over hero photos
        glass: "bg-white/20 text-white backdrop-blur hover:bg-white/30",
        // Electric-green accent (search launcher, "+")
        accent: "bg-green-electric text-white hover:brightness-95",
        solid: "bg-green-forest text-white hover:bg-green-deep",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  }
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  /** Diameter in px. */
  size?: number;
  asChild?: boolean;
}

/** Round icon button used across headers, hero and product cards. */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size = 38, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(iconButtonVariants({ variant }), className)}
        style={{ width: size, height: size, ...style }}
        {...props}
      />
    );
  }
);
IconButton.displayName = "IconButton";
