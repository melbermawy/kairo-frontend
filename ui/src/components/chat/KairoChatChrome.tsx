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

// Canned responses based on section - aligned with actual fixture data
const cannedResponses: Record<string, string[]> = {
  today: [
    "I notice your RevOps Efficiency pillar has 2 high-score opportunities (85 and 78) sitting untouched. Your Attribution Reality content is strong—might be time to balance the mix.",
    "The 'Confessional story → lesson' pattern is your top performer with 28 uses and 4.2 avg engagement. It's perfect for that CMO attribution angle you've pinned.",
    "That '12 hours/week on manual reporting' opportunity scored 85—higher than most. RevOps Lead content could use some love.",
  ],
  packages: [
    "You've got a stale draft from Nov 18 on the RevOps reporting problem. That opportunity still has an 85 score—worth reviving?",
    "Your pipeline: 2 drafts (1 stale), 2 in review, 1 scheduled, 1 published. The attribution piece with Melissa is in good shape.",
    "The HubSpot competitive angle is in review. 'Contrarian hook → framework' pattern could work well for that one—it drives comments.",
  ],
  patterns: [
    "'Confessional story → lesson' is your #1 pattern (28 uses, 31% higher CTR on LinkedIn). 'Hot take → thread' is close behind with 5.1 avg engagement.",
    "'Problem → solution → proof' has only 6 uses but performs well for RevOps content. Underused opportunity there.",
    "The 'Transformation reveal' pattern is barely used (3 times) but gets high saves. Good for case study content.",
  ],
  strategy: [
    "Your brand voice is nailed: 'Direct, optimistic, analytical.' The guardrails around competitor mentions are holding—no dunking by name.",
    "Jordan (RevOps Lead) and Priya (Data-Driven CMO) are your core personas. Most recent content has favored Priya—Jordan content could use attention.",
    "Your 4 pillars are well-defined, but RevOps Efficiency is underrepresented in recent packages. Attribution Reality is carrying the load.",
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
  const [isTyping, setIsTyping] = useState(false);

  // Initialize with intro messages on first open
  const initializeMessages = useCallback(() => {
    if (!hasInitialized) {
      const introMessages: ChatMessage[] = [
        {
          id: generateId(),
          author: "kairo",
          text: `Looking at this week for ${brandName}. You've got 4 high-score opportunities and 1 stale draft that needs attention.`,
          timestamp: formatTime(),
        },
        {
          id: generateId(),
          author: "kairo",
          text: "Your Attribution Reality content is strong, but RevOps Efficiency has untouched opportunities. Want me to help balance the mix?",
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

      // Add user message immediately
      setMessages((prev) => [...prev, userMessage]);
      
      // Show typing indicator
      setIsTyping(true);

      // Simulate AI response delay
      setTimeout(() => {
        const kairoResponse: ChatMessage = {
          id: generateId(),
          author: "kairo",
          text: getCannedResponse(section),
          timestamp: formatTime(),
        };
        
        setIsTyping(false);
        setMessages((prev) => [...prev, kairoResponse]);
      }, 600 + Math.random() * 400); // 600-1000ms random delay
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
        isTyping={isTyping}
      />
    </>
  );
}

KairoChatChrome.displayName = "KairoChatChrome";
