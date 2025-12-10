"use client";

import type { ChatMessage as ChatMessageType } from "./types";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.author === "user";

  return (
    <div
      className={[
        "flex flex-col gap-1",
        isUser ? "items-end" : "items-start",
        // Simple fade-in animation
        "animate-[kairo-fade-in_0.3s_ease-out]",
      ].join(" ")}
    >
      <div
        className={[
          "max-w-[85%] px-3 py-2",
          "rounded-(--kairo-radius-md)",
          "text-sm leading-relaxed",
          isUser
            ? "bg-kairo-aqua-100 text-kairo-ink-900"
            : "bg-kairo-surface-plain border border-kairo-border-subtle text-kairo-ink-800",
        ].join(" ")}
      >
        {message.text}
      </div>
      <span className="text-[10px] text-kairo-ink-400 px-1">
        {message.timestamp}
      </span>
    </div>
  );
}

ChatMessage.displayName = "ChatMessage";
