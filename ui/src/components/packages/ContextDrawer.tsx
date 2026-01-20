"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence, useDragControls, PanInfo } from "framer-motion";
import Link from "next/link";
import { KButton, KTag } from "@/components/ui";
import type { Pattern, OpportunityWithEvidence } from "@/lib/mockApi";

// ============================================
// TYPES
// ============================================

interface BrandVoice {
  summary: string;
  toneTags: string[];
  nevers: string[];
}

interface Guardrails {
  do: string[];
  dont: string[];
}

interface ContextDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  voice: BrandVoice;
  guardrails: Guardrails;
  patterns: Pattern[];
  opportunity?: OpportunityWithEvidence | null;
  brandId: string;
  onApplyPattern?: (patternId: string, channel: string) => void;
  initialTab?: "voice" | "guardrails" | "source" | "patterns";
}

// Mobile snap points
const SNAP_POINTS = {
  closed: 0,
  half: 0.55,
  full: 0.92,
};

const DESKTOP_WIDTH = 400;

type TabId = "voice" | "guardrails" | "source" | "patterns";

// ============================================
// MAIN COMPONENT
// ============================================

export function ContextDrawer({
  isOpen,
  onClose,
  voice,
  guardrails,
  patterns,
  opportunity,
  brandId,
  onApplyPattern,
  initialTab = "voice",
}: ContextDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSnapPoint, setMobileSnapPoint] = useState<keyof typeof SNAP_POINTS>("half");
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [applyingPatternId, setApplyingPatternId] = useState<string | null>(null);
  const dragControls = useDragControls();

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Reset state when drawer opens
  useEffect(() => {
    if (isOpen) {
      setMobileSnapPoint("half");
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Focus close button when drawer opens
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      const timer = setTimeout(() => closeButtonRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle mobile drag
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const velocity = info.velocity.y;
      const offset = info.offset.y;

      if (velocity > 500 || offset > 200) {
        if (mobileSnapPoint === "half") {
          onClose();
        } else {
          setMobileSnapPoint("half");
        }
        return;
      }

      if (velocity < -500 || offset < -200) {
        setMobileSnapPoint("full");
      }
    },
    [mobileSnapPoint, onClose]
  );

  const handleApplyPattern = useCallback((patternId: string, channel: string) => {
    setApplyingPatternId(patternId);
    if (onApplyPattern) {
      onApplyPattern(patternId, channel);
    }
    setTimeout(() => setApplyingPatternId(null), 1000);
  }, [onApplyPattern]);

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "voice", label: "Voice" },
    { id: "guardrails", label: "Guardrails" },
    { id: "source", label: "Source" },
    { id: "patterns", label: "Patterns", count: patterns.length },
  ];

  const drawerContent = (
    <>
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-kairo-border-subtle bg-kairo-bg-panel">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-kairo-fg">Context</h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1.5 rounded-lg text-kairo-fg-muted hover:text-kairo-fg hover:bg-kairo-bg-hover transition-colors"
            aria-label="Close drawer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-kairo-accent-500/10 text-kairo-accent-400"
                  : "text-kairo-fg-muted hover:text-kairo-fg hover:bg-kairo-bg-hover",
              ].join(" ")}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-kairo-bg-elevated">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-5">
        {activeTab === "voice" && <VoiceTab voice={voice} />}
        {activeTab === "guardrails" && <GuardrailsTab guardrails={guardrails} />}
        {activeTab === "source" && <SourceTab opportunity={opportunity} brandId={brandId} />}
        {activeTab === "patterns" && (
          <PatternsTab
            patterns={patterns}
            onApplyPattern={handleApplyPattern}
            applyingPatternId={applyingPatternId}
          />
        )}
      </div>
    </>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Desktop drawer */}
          {!isMobile && (
            <motion.div
              ref={drawerRef}
              className="fixed right-0 top-0 bottom-0 z-50 flex flex-col bg-kairo-bg-panel shadow-2xl"
              style={{ width: DESKTOP_WIDTH }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              role="dialog"
              aria-modal="true"
            >
              {drawerContent}
            </motion.div>
          )}

          {/* Mobile drawer (bottom sheet) */}
          {isMobile && (
            <motion.div
              ref={drawerRef}
              className="fixed left-0 right-0 bottom-0 z-50 flex flex-col bg-kairo-bg-panel rounded-t-2xl shadow-2xl"
              style={{ maxHeight: "92vh" }}
              initial={{ y: "100%" }}
              animate={{
                y: `${(1 - SNAP_POINTS[mobileSnapPoint]) * 100}%`,
                height: `${SNAP_POINTS[mobileSnapPoint] * 100}vh`,
              }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              drag="y"
              dragControls={dragControls}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.1}
              onDragEnd={handleDragEnd}
              role="dialog"
              aria-modal="true"
            >
              <div
                className="flex-shrink-0 flex justify-center py-3 cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="w-10 h-1 rounded-full bg-kairo-border-strong" />
              </div>
              {drawerContent}
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================
// TAB CONTENT COMPONENTS
// ============================================

function VoiceTab({ voice }: { voice: BrandVoice }) {
  return (
    <div className="space-y-5">
      <section>
        <h3 className="text-[11px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-2">
          Voice Summary
        </h3>
        <p className="text-sm text-kairo-fg-muted leading-relaxed">
          {voice.summary}
        </p>
      </section>

      <section>
        <h3 className="text-[11px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-2">
          Tone
        </h3>
        <div className="flex flex-wrap gap-2">
          {voice.toneTags.map((tag) => (
            <KTag key={tag} variant="outline" className="text-xs">
              {tag}
            </KTag>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-[11px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-2">
          Never Do
        </h3>
        <ul className="space-y-1.5">
          {voice.nevers.map((never, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-kairo-fg-muted">
              <span className="text-kairo-error-fg shrink-0">✕</span>
              <span>{never}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function GuardrailsTab({ guardrails }: { guardrails: Guardrails }) {
  return (
    <div className="space-y-5">
      {guardrails.do.length > 0 && (
        <section>
          <h3 className="text-[11px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-2">
            Do
          </h3>
          <ul className="space-y-1.5">
            {guardrails.do.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-kairo-fg-muted">
                <span className="text-kairo-score-high-fg shrink-0">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {guardrails.dont.length > 0 && (
        <section>
          <h3 className="text-[11px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-2">
            Don't
          </h3>
          <ul className="space-y-1.5">
            {guardrails.dont.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-kairo-fg-muted">
                <span className="text-kairo-error-fg shrink-0">✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function SourceTab({ opportunity, brandId }: { opportunity?: OpportunityWithEvidence | null; brandId: string }) {
  if (!opportunity) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-kairo-fg-muted">No source opportunity linked</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <span
          className={[
            "inline-flex items-center justify-center w-10 h-8 rounded-lg text-sm font-bold shrink-0",
            opportunity.score >= 80
              ? "bg-kairo-score-high-bg text-kairo-score-high-fg"
              : opportunity.score >= 70
              ? "bg-kairo-score-medium-bg text-kairo-score-medium-fg"
              : "bg-kairo-score-low-bg text-kairo-score-low-fg",
          ].join(" ")}
        >
          {opportunity.score}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-kairo-fg">{opportunity.title}</h3>
          <p className="text-xs text-kairo-fg-muted mt-1">{opportunity.hook}</p>
        </div>
      </div>

      {opportunity.why_now && opportunity.why_now.length > 0 && (
        <section>
          <h4 className="text-[11px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-2">
            Why Now
          </h4>
          <ul className="space-y-1.5">
            {opportunity.why_now.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-kairo-fg-muted">
                <span className="text-kairo-accent-400 shrink-0">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link
        href={`/brands/${brandId}/today`}
        className="inline-flex items-center gap-2 text-xs text-kairo-accent-400 hover:text-kairo-accent-300"
      >
        View on Today board
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}

interface PatternsTabProps {
  patterns: Pattern[];
  onApplyPattern: (patternId: string, channel: string) => void;
  applyingPatternId: string | null;
}

function PatternsTab({ patterns, onApplyPattern, applyingPatternId }: PatternsTabProps) {
  if (patterns.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-kairo-fg-muted">No pattern suggestions available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-kairo-fg-subtle">
        Apply a pattern to create a new variant using a proven structure.
      </p>
      {patterns.slice(0, 5).map((pattern) => (
        <PatternCard
          key={pattern.id}
          pattern={pattern}
          onApply={(channel) => onApplyPattern(pattern.id, channel)}
          isApplying={applyingPatternId === pattern.id}
        />
      ))}
    </div>
  );
}

function PatternCard({
  pattern,
  onApply,
  isApplying,
}: {
  pattern: Pattern;
  onApply: (channel: string) => void;
  isApplying: boolean;
}) {
  const [showChannels, setShowChannels] = useState(false);

  return (
    <div className="p-3 rounded-lg border border-kairo-border-subtle bg-kairo-bg-elevated/30 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-kairo-fg">{pattern.name}</p>
          <p className="text-[11px] text-kairo-fg-subtle">{pattern.performanceHint}</p>
        </div>
        <span className="text-[10px] text-kairo-fg-muted">{pattern.usageCount} uses</span>
      </div>

      <div className="flex flex-wrap gap-1">
        {pattern.beats.map((beat, idx) => (
          <span
            key={idx}
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-kairo-accent-500/10 text-kairo-accent-400"
          >
            {beat}
          </span>
        ))}
      </div>

      {showChannels ? (
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-[10px] text-kairo-fg-subtle">Channel:</span>
          {pattern.channels.map((ch) => (
            <button
              key={ch}
              onClick={() => {
                setShowChannels(false);
                onApply(ch);
              }}
              className="px-2 py-1 rounded text-[10px] font-medium bg-kairo-bg-hover hover:bg-kairo-accent-500/10 hover:text-kairo-accent-400 transition-colors capitalize"
            >
              {ch === "x" ? "X" : ch}
            </button>
          ))}
          <button
            onClick={() => setShowChannels(false)}
            className="ml-auto text-[10px] text-kairo-fg-subtle hover:text-kairo-fg"
          >
            Cancel
          </button>
        </div>
      ) : (
        <KButton
          size="sm"
          variant="ghost"
          onClick={() => setShowChannels(true)}
          disabled={isApplying}
          className="w-full text-[11px] justify-center"
        >
          {isApplying ? "Creating..." : "Apply Pattern"}
        </KButton>
      )}
    </div>
  );
}

ContextDrawer.displayName = "ContextDrawer";
