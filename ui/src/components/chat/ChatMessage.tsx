"use client";

import { useState, useEffect } from "react";
import type { ChatMessage as ChatMessageType } from "./types";

interface ChatMessageProps {
  message: ChatMessageType;
  animateIn?: boolean;
  delay?: number;
}

export function ChatMessage({ message, animateIn = false, delay = 0 }: ChatMessageProps) {
  const isUser = message.author === "user";
  const [isVisible, setIsVisible] = useState(!animateIn);

  useEffect(() => {
    if (animateIn) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [animateIn, delay]);

  return (
    <div
      className={[
        "flex flex-col gap-1",
        isUser ? "items-end" : "items-start",
        // Animation classes
        "transition-all duration-500 ease-out",
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-4",
      ].join(" ")}
    >
      <div
        className={[
          "max-w-[85%] px-3 py-2",
          "rounded-(--kairo-radius-md)",
          "text-sm leading-relaxed",
          // Hover effect for Kairo messages
          !isUser && "hover:shadow-sm transition-shadow duration-200",
          isUser
            ? "bg-kairo-aqua-100 text-kairo-ink-900"
            : "bg-kairo-surface-plain border border-kairo-border-subtle text-kairo-ink-800",
        ].join(" ")}
      >
        {message.text}
      </div>
      <span className={[
        "text-[10px] text-kairo-ink-400 px-1",
        "transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0",
      ].join(" ")}>
        {message.timestamp}
      </span>
    </div>
  );
}

ChatMessage.displayName = "ChatMessage";
