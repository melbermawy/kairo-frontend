"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { QuickActions } from "./QuickActions";
import { TypingIndicator } from "./TypingIndicator";
import type { ChatMessage as ChatMessageType } from "./types";

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  section: string;
  messages: ChatMessageType[];
  onSendMessage: (text: string) => void;
  isTyping?: boolean;
}

export function ChatDrawer({
  isOpen,
  onClose,
  brandName,
  section,
  messages,
  onSendMessage,
  isTyping = false,
}: ChatDrawerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          transitionDuration: "300ms",
          transitionTimingFunction: "ease-out",
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
          transitionDuration: "350ms",
          transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
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
          isTyping={isTyping}
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
          transitionDuration: "350ms",
          transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
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
          isTyping={isTyping}
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
  isTyping?: boolean;
}

function DrawerContent({
  brandName,
  section,
  messages,
  onClose,
  onSendMessage,
  messagesEndRef,
  isTyping = false,
}: DrawerContentProps) {
  // Coming Soon mode - set to true to enable
  const isComingSoon = true;

  return (
    <>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-kairo-aqua-50 border-b border-kairo-aqua-100">
        <div className="min-w-0">
          <h2 className="text-base text-kairo-ink-900 font-[family-name:var(--font-lugrasimo)]">Kairo</h2>
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

      {isComingSoon ? (
        /* Coming Soon Content */
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          {/* Animated icon */}
          <div className="w-16 h-16 rounded-2xl bg-kairo-aqua-100 flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-kairo-aqua-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
              />
            </svg>
          </div>

          {/* Coming Soon Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-kairo-aqua-100 border border-kairo-aqua-200 mb-4">
            <span className="w-2 h-2 rounded-full bg-kairo-aqua-500 animate-pulse" />
            <span className="text-sm font-medium text-kairo-aqua-700">
              Coming Soon
            </span>
          </div>

          <h3 className="text-lg font-semibold text-kairo-ink-900 mb-2 text-center">
            AI-Powered Assistance
          </h3>

          <p className="text-sm text-kairo-ink-600 text-center max-w-[280px] leading-relaxed">
            Ask Kairo will help you find opportunities, refine content, and stay aligned with your brand strategy.
          </p>

          {/* Decorative dots */}
          <div className="mt-6 flex gap-2">
            <div className="w-8 h-1 rounded-full bg-kairo-aqua-200" />
            <div className="w-5 h-1 rounded-full bg-kairo-aqua-200" />
            <div className="w-3 h-1 rounded-full bg-kairo-aqua-200" />
          </div>
        </div>
      ) : (
        <>
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
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions */}
          <QuickActions onAction={onSendMessage} />

          {/* Input */}
          <ChatInput onSend={onSendMessage} />
        </>
      )}
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
