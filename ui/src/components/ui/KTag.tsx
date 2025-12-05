import { HTMLAttributes, forwardRef } from "react";

type KTagVariant = "default" | "filled" | "outline" | "trend" | "evergreen" | "competitive" | "campaign" | "danger" | "muted";

interface KTagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: KTagVariant;
}

const variantStyles: Record<KTagVariant, string> = {
  default: "bg-kairo-primary-soft text-kairo-primary-deep",
  filled: "bg-kairo-primary-soft text-kairo-primary-deep", // alias for default
  outline: "bg-transparent border border-kairo-border-soft text-kairo-text-main",
  trend: "bg-kairo-pill-trend-bg text-kairo-pill-trend-text",
  evergreen: "bg-kairo-pill-evergreen-bg text-kairo-pill-evergreen-text",
  competitive: "bg-kairo-pill-competitive-bg text-kairo-pill-competitive-text",
  campaign: "bg-kairo-pill-campaign-bg text-kairo-pill-campaign-text",
  danger: "bg-kairo-danger-soft text-kairo-danger",
  muted: "bg-kairo-bg-rail text-kairo-text-muted",
};

export const KTag = forwardRef<HTMLSpanElement, KTagProps>(
  ({ variant = "default", className = "", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={[
          "inline-flex items-center",
          "px-2 py-0.5",
          "rounded-[5px]",
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
