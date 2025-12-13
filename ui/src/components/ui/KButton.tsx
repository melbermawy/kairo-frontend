import { ButtonHTMLAttributes, forwardRef } from "react";

type KButtonVariant = "primary" | "secondary" | "ghost";
type KButtonSize = "sm" | "md";

interface KButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: KButtonVariant;
  size?: KButtonSize;
}

const variantStyles: Record<KButtonVariant, string> = {
  primary: [
    "bg-kairo-action-primary-bg text-kairo-action-primary-fg",
    "hover:bg-kairo-action-primary-hover-bg",
    "active:bg-kairo-action-primary-hover-bg",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" "),
  secondary: [
    "bg-kairo-action-muted-bg text-kairo-action-muted-fg",
    "border border-kairo-border-subtle",
    "hover:bg-kairo-sand-100 hover:border-kairo-border-strong",
    "active:bg-kairo-sand-100",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" "),
  ghost: [
    "bg-transparent text-kairo-aqua-600",
    "hover:bg-kairo-aqua-50",
    "active:bg-kairo-aqua-100",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" "),
};

const sizeStyles: Record<KButtonSize, string> = {
  sm: "px-3 py-1.5 text-[13px]",
  md: "px-4 py-2 text-[15px]",
};

export const KButton = forwardRef<HTMLButtonElement, KButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={[
          "inline-flex items-center justify-center gap-1.5",
          "font-medium",
          "rounded-(--kairo-radius-pill)",
          "transition-all duration-100",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-kairo-aqua-500 focus-visible:ring-offset-2",
          sizeStyles[size],
          variantStyles[variant],
          className,
        ].join(" ")}
        {...props}
      >
        {children}
      </button>
    );
  }
);

KButton.displayName = "KButton";
