import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Hide the leading magnifier icon. */
  hideIcon?: boolean;
}

/** Yonima search pill. Renders a real input; wrap in a form/Link at call site. */
export const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ className, hideIcon = false, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-pill bg-white border border-border px-4 h-11 text-sm text-ink shadow-card",
          className
        )}
      >
        {!hideIcon && (
          <Search className="h-4 w-4 text-ink-muted shrink-0" aria-hidden="true" />
        )}
        <input
          ref={ref}
          type="search"
          className="flex-1 bg-transparent outline-none placeholder:text-ink-muted"
          {...props}
        />
      </div>
    );
  }
);
SearchField.displayName = "SearchField";
