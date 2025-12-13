import { HTMLAttributes, forwardRef } from "react";

type KTagVariant =
  | "default"
  | "filled"
  | "outline"
  | "trend"
  | "evergreen"
  | "competitive"
  | "campaign"
  | "danger"
  | "muted";

interface KTagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: KTagVariant;
}

const variantStyles: Record<KTagVariant, string> = {
  default: "bg-kairo-aqua-50 text-kairo-aqua-600",
  filled: "bg-kairo-aqua-50 text-kairo-aqua-600", // alias for default
  outline: "bg-transparent border border-kairo-border-subtle text-kairo-ink-700",
  trend: "bg-kairo-tag-trend-bg text-kairo-tag-trend-fg",
  evergreen: "bg-kairo-tag-evergreen-bg text-kairo-tag-evergreen-fg",
  competitive: "bg-kairo-tag-competitive-bg text-kairo-tag-competitive-fg",
  campaign: "bg-kairo-tag-campaign-bg text-kairo-tag-campaign-fg",
  danger: "bg-kairo-tag-low-score-bg text-kairo-tag-low-score-fg",
  muted: "bg-kairo-sand-100 text-kairo-ink-500",
};

export const KTag = forwardRef<HTMLSpanElement, KTagProps>(
  ({ variant = "default", className = "", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={[
          "inline-flex items-center",
          "px-2 py-0.5",
          "rounded-(--kairo-radius-pill)",
          "text-[11px] font-medium leading-tight",
          variantStyles[variant],
          className,
        ].join(" ")}
        {...props}
      >
        {children}
      </span>
    );
  }
);

KTag.displayName = "KTag";
