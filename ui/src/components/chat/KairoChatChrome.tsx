"use client";

import { useState, useCallback, ReactNode } from "react";
import { ChatDrawer } from "./ChatDrawer";
import type { ChatMessage } from "./types";

interface KairoChatChromeProps {
  brandName: string;
  section: string;
  children: ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function formatTime(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

// Canned responses based on section
const cannedResponses: Record<string, string[]> = {
  today: [
    "Based on your current pipeline, I'd recommend focusing on the Attribution Reality pillar today—it's been 5 days since your last post in that area.",
    "Your engagement metrics are trending up. The 'Confessional story → lesson' pattern is performing well for you.",
    "I see 2 high-signal opportunities that align with your RevOps Lead persona. Want me to draft packages for them?",
  ],
  packages: [
    "Looking at your content pipeline, you have 3 packages in draft that could be ready to publish this week.",
    "The 'Hot take → thread' pattern has been your best performer. Consider using it for the attribution topic.",
    "I can help refine any of these packages. Just let me know which one you'd like to work on.",
  ],
  patterns: [
    "Your top-performing patterns this month are 'Confessional story → lesson' and 'Hot take → thread'.",
    "Based on your brand voice, I'd recommend experimenting with the 'Behind the curtain' pattern—it aligns well with your 'no buzzwords' tone.",
    "The patterns library shows you haven't used 'Myth vs reality' in a while. It could be a good fit for your attribution content.",
  ],
  strategy: [
    "Your brand strategy is well-defined. The guardrails around competitor mentions are being respected across all content.",
    "I notice your 'RevOps Efficiency' pillar has fewer recent posts. Want me to surface opportunities in that area?",
    "Your personas are clearly defined. Jordan (RevOps Lead) content has been outperforming Priya (CMO) content by 23%.",
  ],
};

function getCannedResponse(section: string): string {
  const responses = cannedResponses[section] || cannedResponses.today;
  return responses[Math.floor(Math.random() * responses.length)];
}

export function KairoChatChrome({
  brandName,
  section,
  children,
  isOpen,
  onOpenChange,
}: KairoChatChromeProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize with intro messages on first open
  const initializeMessages = useCallback(() => {
    if (!hasInitialized) {
      const introMessages: ChatMessage[] = [
        {
          id: generateId(),
          author: "kairo",
          text: `Looking at this week's opportunities for ${brandName}.`,
          timestamp: formatTime(),
        },
        {
          id: generateId(),
          author: "kairo",
          text: "You've published 2 of 4 target posts; want suggestions for what to schedule next?",
          timestamp: formatTime(),
        },
      ];
      setMessages(introMessages);
      setHasInitialized(true);
    }
  }, [brandName, hasInitialized]);

  // Handle open state changes
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        initializeMessages();
      }
      onOpenChange(open);
    },
    [onOpenChange, initializeMessages]
  );

  // Send a message and get canned response
  const handleSendMessage = useCallback(
    (text: string) => {
      const userMessage: ChatMessage = {
        id: generateId(),
        author: "user",
        text,
        timestamp: formatTime(),
      };

      const kairoResponse: ChatMessage = {
        id: generateId(),
        author: "kairo",
        text: getCannedResponse(section),
        timestamp: formatTime(),
      };

      setMessages((prev) => [...prev, userMessage, kairoResponse]);
    },
    [section]
  );

  return (
    <>
      {children}
      <ChatDrawer
        isOpen={isOpen}
        onClose={() => handleOpenChange(false)}
        brandName={brandName}
        section={section}
        messages={messages}
        onSendMessage={handleSendMessage}
      />
    </>
  );
}

KairoChatChrome.displayName = "KairoChatChrome";
