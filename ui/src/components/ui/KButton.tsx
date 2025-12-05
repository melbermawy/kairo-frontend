import { ButtonHTMLAttributes, forwardRef } from "react";

type KButtonVariant = "primary" | "secondary" | "ghost";
type KButtonSize = "sm" | "md";

interface KButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: KButtonVariant;
  size?: KButtonSize;
}

const variantStyles: Record<KButtonVariant, string> = {
  primary: [
    "bg-kairo-primary text-kairo-text-inverse",
    "hover:bg-kairo-primary-deep hover:shadow-soft",
    "active:bg-kairo-primary-deep",
    "disabled:bg-kairo-primary-soft disabled:text-kairo-text-subtle disabled:cursor-not-allowed disabled:shadow-none",
  ].join(" "),
  secondary: [
    "bg-kairo-bg-elevated text-kairo-text-main border border-kairo-border-soft",
    "hover:bg-kairo-primary-soft hover:border-kairo-primary-soft",
    "active:bg-kairo-primary-soft",
    "disabled:bg-kairo-bg-rail disabled:text-kairo-text-subtle disabled:cursor-not-allowed",
  ].join(" "),
  ghost: [
    "bg-transparent text-kairo-primary-deep",
    "hover:bg-kairo-primary-soft",
    "active:bg-kairo-primary-soft",
    "disabled:text-kairo-text-subtle disabled:cursor-not-allowed disabled:bg-transparent",
  ].join(" "),
};

const sizeStyles: Record<KButtonSize, string> = {
  sm: "px-3 py-1.5 text-[13px]",
  md: "px-4 py-2 text-[14px]",
};

export const KButton = forwardRef<HTMLButtonElement, KButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={[
          "inline-flex items-center justify-center gap-1.5",
          "font-medium",
          "rounded-[8px]",
          "transition-all duration-100",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-kairo-primary focus-visible:ring-offset-2",
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
