"use client";

import { useState, useCallback, KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed) {
      onSend(trimmed);
      setValue("");
    }
  }, [value, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="flex items-end gap-2 p-3 border-t border-kairo-border-subtle bg-kairo-surface-plain">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask Kairo anything..."
        rows={1}
        className={[
          "flex-1 resize-none",
          "px-3 py-2",
          "text-sm text-kairo-ink-900 placeholder:text-kairo-ink-400",
          "bg-kairo-sand-50 border border-kairo-border-subtle",
          "rounded-(--kairo-radius-md)",
          "focus:outline-none focus:border-kairo-aqua-300 focus:ring-1 focus:ring-kairo-aqua-200",
          "transition-colors duration-150",
        ].join(" ")}
      />
      <button
        onClick={handleSend}
        disabled={!value.trim()}
        className={[
          "px-3 py-2",
          "text-sm font-medium",
          "bg-kairo-aqua-500 text-white",
          "rounded-(--kairo-radius-md)",
          "hover:bg-kairo-aqua-600",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors duration-150",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-kairo-aqua-500 focus-visible:ring-offset-2",
        ].join(" ")}
      >
        Send
      </button>
    </div>
  );
}

ChatInput.displayName = "ChatInput";
