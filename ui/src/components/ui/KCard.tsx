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
          "bg-kairo-bg-elevated",
          "rounded-[10px]",
          "p-5",
          elevated
            ? "shadow-card border border-kairo-border-soft/50"
            : "border border-kairo-border-soft",
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
