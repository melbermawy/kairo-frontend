import { HTMLAttributes, forwardRef } from "react";

interface KCardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export const KCard = forwardRef<HTMLDivElement, KCardProps>(
  ({ elevated = false, className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={[
          "bg-kairo-surface-plain",
          "rounded-(--kairo-radius-md)",
          "p-5",
          elevated
            ? "shadow-soft"
            : "border border-kairo-border-subtle",
          "transition-shadow duration-150",
          className,
        ].join(" ")}
        {...props}
      >
        {children}
      </div>
    );
  }
);

KCard.displayName = "KCard";
