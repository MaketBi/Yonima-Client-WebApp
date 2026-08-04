import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

interface WordmarkProps {
  /** Font size in px (matches the DS `size` prop). */
  size?: number;
  /** Tone: forest on light surfaces, inverse on green/photo backgrounds. */
  tone?: "forest" | "inverse";
  className?: string;
}

/**
 * Yonima wordmark. The produit spec (§0) uses "Yonima" (not the marketing
 * lowercase "yonima+"). Kept as a component so the lockup can later swap to
 * an SVG logo without touching call sites.
 */
export function Wordmark({ size = 20, tone = "forest", className }: WordmarkProps) {
  return (
    <span
      className={cn(
        "font-bold tracking-tight leading-none select-none",
        tone === "inverse" ? "text-white" : "text-green-forest",
        className
      )}
      style={{ fontSize: size, letterSpacing: "-0.03em" }}
    >
      {APP_NAME}
    </span>
  );
}
