"use client";

export function TypingIndicator() {
  return (
    <div className="flex flex-col gap-1 items-start">
      <div
        className={[
          "px-4 py-3",
          "bg-kairo-surface-plain border border-kairo-border-subtle",
          "rounded-(--kairo-radius-md)",
          "animate-pulse",
        ].join(" ")}
      >
        <div className="flex gap-1.5 items-center">
          <div 
            className="w-2 h-2 bg-kairo-ink-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms", animationDuration: "1s" }}
          />
          <div 
            className="w-2 h-2 bg-kairo-ink-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms", animationDuration: "1s" }}
          />
          <div 
            className="w-2 h-2 bg-kairo-ink-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms", animationDuration: "1s" }}
          />
        </div>
      </div>
      <span className="text-[10px] text-kairo-ink-400 px-1 italic">
        kairo is thinking...
      </span>
    </div>
  );
}

TypingIndicator.displayName = "TypingIndicator";

