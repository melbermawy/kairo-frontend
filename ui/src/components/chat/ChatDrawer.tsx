"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { QuickActions } from "./QuickActions";
import type { ChatMessage as ChatMessageType } from "./types";

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  section: string;
  messages: ChatMessageType[];
  onSendMessage: (text: string) => void;
}

export function ChatDrawer({
  isOpen,
  onClose,
  brandName,
  section,
  messages,
  onSendMessage,
}: ChatDrawerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [shouldAnimateMessages, setShouldAnimateMessages] = useState(false);
  const wasOpenRef = useRef(false);

  // Track when drawer opens for the first time to trigger animation
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setShouldAnimateMessages(true);
      // Reset animation flag after animation completes
      const timer = setTimeout(() => setShouldAnimateMessages(false), 300);
      return () => clearTimeout(timer);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={[
          "fixed inset-0 z-40",
          "bg-kairo-ink-900/20",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        ].join(" ")}
        style={{
          transitionProperty: "opacity",
          transitionDuration: "var(--kairo-motion-medium)",
          transitionTimingFunction: "var(--kairo-ease-soft)",
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Desktop: Right side sheet */}
      <div
        className={[
          "fixed z-50",
          // Desktop positioning
          "hidden lg:flex lg:flex-col",
          "lg:top-0 lg:right-0 lg:bottom-0",
          "lg:w-[380px]",
          // Visual
          "bg-kairo-sand-50",
          "border-l border-kairo-border-subtle",
          "shadow-elevated",
          // Animation
          isOpen ? "lg:translate-x-0" : "lg:translate-x-full",
        ].join(" ")}
        style={{
          transitionProperty: "transform",
          transitionDuration: "var(--kairo-motion-medium)",
          transitionTimingFunction: "var(--kairo-ease-soft)",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Kairo chat"
      >
        <DrawerContent
          brandName={brandName}
          section={section}
          messages={messages}
          onClose={onClose}
          onSendMessage={onSendMessage}
          messagesEndRef={messagesEndRef}
          shouldAnimateMessages={shouldAnimateMessages}
        />
      </div>

      {/* Mobile: Bottom sheet */}
      <div
        className={[
          "fixed z-50",
          // Mobile positioning
          "lg:hidden flex flex-col",
          "left-0 right-0 bottom-0",
          "h-[70vh]",
          // Visual
          "bg-kairo-sand-50",
          "border-t border-kairo-border-subtle",
          "rounded-t-(--kairo-radius-lg)",
          "shadow-elevated",
          // Animation
          isOpen ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
        style={{
          transitionProperty: "transform",
          transitionDuration: "var(--kairo-motion-medium)",
          transitionTimingFunction: "var(--kairo-ease-soft)",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Kairo chat"
      >
        <DrawerContent
          brandName={brandName}
          section={section}
          messages={messages}
          onClose={onClose}
          onSendMessage={onSendMessage}
          messagesEndRef={messagesEndRef}
          shouldAnimateMessages={shouldAnimateMessages}
        />
      </div>
    </>
  );
}

interface DrawerContentProps {
  brandName: string;
  section: string;
  messages: ChatMessageType[];
  onClose: () => void;
  onSendMessage: (text: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  shouldAnimateMessages: boolean;
}

function DrawerContent({
  brandName,
  section,
  messages,
  onClose,
  onSendMessage,
  messagesEndRef,
  shouldAnimateMessages,
}: DrawerContentProps) {
  return (
    <>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-kairo-aqua-50 border-b border-kairo-aqua-100">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-kairo-ink-900">kairo</h2>
          <p className="text-xs text-kairo-ink-500 truncate">
            helping {brandName} – {section}
          </p>
        </div>
        <button
          onClick={onClose}
          className={[
            "flex items-center justify-center",
            "w-7 h-7",
            "text-kairo-ink-500 hover:text-kairo-ink-700",
            "hover:bg-kairo-aqua-100",
            "rounded-(--kairo-radius-sm)",
            "transition-colors duration-150",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-kairo-aqua-500",
          ].join(" ")}
          aria-label="Close chat"
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      </header>

      {/* Context capsule */}
      <div className="px-4 py-2 border-b border-kairo-border-subtle">
        <div
          className={[
            "inline-flex items-center gap-2",
            "px-2.5 py-1",
            "bg-kairo-sand-100 text-kairo-ink-600",
            "rounded-(--kairo-radius-pill)",
            "text-xs",
          ].join(" ")}
        >
          <span className="font-medium">{brandName}</span>
          <span className="text-kairo-ink-400">·</span>
          <span>{section}</span>
          <span className="text-kairo-ink-400">·</span>
          <span className="text-kairo-ink-500">fresh opportunities, on-brand</span>
        </div>
      </div>

      {/* Messages */}
      <div
        className={[
          "flex-1 overflow-y-auto px-4 py-4 space-y-3",
          shouldAnimateMessages ? "animate-[kairo-fade-up_var(--kairo-motion-slow)_var(--kairo-ease-soft)]" : "",
        ].join(" ")}
      >
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      <QuickActions onAction={onSendMessage} />

      {/* Input */}
      <ChatInput onSend={onSendMessage} />
    </>
  );
}

function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

ChatDrawer.displayName = "ChatDrawer";
