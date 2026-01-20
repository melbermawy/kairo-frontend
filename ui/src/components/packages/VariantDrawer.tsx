"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence, useDragControls, PanInfo } from "framer-motion";
import { KButton, KTag } from "@/components/ui";
import type { Variant } from "@/lib/mockApi";

// ============================================
// TYPES
// ============================================

interface VariantDrawerProps {
  variant: Variant | null;
  isOpen: boolean;
  onClose: () => void;
  onDuplicate?: (variantId: string) => void;
  channelLabel: string;
  variantIndex: number;
}

// Mobile snap points (percentage of viewport height)
const SNAP_POINTS = {
  closed: 0,
  collapsed: 0.35,
  half: 0.55,
  full: 0.92,
};

// ============================================
// CONFIG
// ============================================

const DESKTOP_WIDTH = 580; // px - wider for better content reading

const statusConfig: Record<string, { label: string; variant: "muted" | "campaign" | "evergreen" }> = {
  draft: { label: "Draft", variant: "muted" },
  edited: { label: "Edited", variant: "campaign" },
  approved: { label: "Approved", variant: "evergreen" },
};

// Content type detection based on channel
const getContentType = (channel: string): string => {
  const types: Record<string, string> = {
    tiktok: "Script",
    instagram: "Caption",
    linkedin: "Post",
    x: "Thread",
  };
  return types[channel.toLowerCase()] || "Content";
};

// ============================================
// MAIN COMPONENT
// ============================================

export function VariantDrawer({
  variant,
  isOpen,
  onClose,
  onDuplicate,
  channelLabel,
  variantIndex,
}: VariantDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSnapPoint, setMobileSnapPoint] = useState<keyof typeof SNAP_POINTS>("half");
  const dragControls = useDragControls();

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Reset snap point when drawer opens
  useEffect(() => {
    if (isOpen) {
      setMobileSnapPoint("half");
    }
  }, [isOpen, variant?.id]);

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

  // Focus trap - focus close button when drawer opens
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
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

  // Handle mobile drag end
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const velocity = info.velocity.y;
      const offset = info.offset.y;

      // Fast swipe down = close
      if (velocity > 500 || offset > 200) {
        if (mobileSnapPoint === "collapsed") {
          onClose();
        } else if (mobileSnapPoint === "half") {
          setMobileSnapPoint("collapsed");
        } else {
          setMobileSnapPoint("half");
        }
        return;
      }

      // Fast swipe up = expand
      if (velocity < -500 || offset < -200) {
        if (mobileSnapPoint === "collapsed") {
          setMobileSnapPoint("half");
        } else {
          setMobileSnapPoint("full");
        }
        return;
      }
    },
    [mobileSnapPoint, onClose]
  );

  const handleDuplicate = useCallback(() => {
    if (variant && onDuplicate) {
      onDuplicate(variant.id);
    }
  }, [variant, onDuplicate]);

  if (!variant) return null;

  const statusInfo = statusConfig[variant.status] || statusConfig.draft;
  const updatedAt = "2d ago"; // Stub since not in current data
  const owner = "Nadia"; // Stub owner

  // Parse body content - could be script, caption, etc.
  const bodyLines = variant.body.split("\n").filter((line) => line.trim());
  const contentType = getContentType(variant.channel);

  // Detect if content has structure (numbered lines, timestamps, etc.)
  const hasStructure = bodyLines.some((line) =>
    /^(\d+[\.\):]|\[\d+:\d+\]|HOOK:|CTA:|BEAT \d+)/i.test(line.trim())
  );

  // Common drawer content
  const drawerContent = (
    <>
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-kairo-border-subtle bg-kairo-bg-panel">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Channel + Variant index */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base font-semibold text-kairo-fg">
                {channelLabel} v{variantIndex}
              </span>
              <KTag variant={statusInfo.variant} className="uppercase text-[10px]">
                {statusInfo.label}
              </KTag>
              {variant.score !== undefined && variant.score > 0 && (
                <span
                  className={[
                    "inline-flex items-center justify-center w-8 h-6 rounded text-xs font-bold ml-1",
                    variant.score >= 80
                      ? "bg-kairo-score-high-bg text-kairo-score-high-fg"
                      : variant.score >= 60
                      ? "bg-kairo-score-medium-bg text-kairo-score-medium-fg"
                      : "bg-kairo-score-low-bg text-kairo-score-low-fg",
                  ].join(" ")}
                >
                  {variant.score}
                </span>
              )}
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-1.5 text-xs text-kairo-fg-subtle">
              <span>{contentType}</span>
              <span className="text-kairo-border-strong">·</span>
              <span>Last edited by {owner}</span>
              <span className="text-kairo-border-strong">·</span>
              <span>{updatedAt}</span>
            </div>
          </div>

          {/* Close button */}
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg text-kairo-fg-muted hover:text-kairo-fg hover:bg-kairo-bg-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-kairo-accent-500"
            aria-label="Close drawer"
            data-testid="variant-drawer-close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto overscroll-contain"
        data-testid="variant-drawer-content"
      >
        <div className="p-6 space-y-6">
          {/* Full variant content - primary focus */}
          <section>
            <div className={[
              "p-4 rounded-lg border",
              "bg-kairo-bg-card border-kairo-border-subtle",
            ].join(" ")}>
              {hasStructure ? (
                <div className="space-y-2">
                  {bodyLines.map((line, index) => {
                    // Check if line is a section header
                    const isHeader = /^(HOOK:|CTA:|BEAT \d+|INTRO:|OUTRO:)/i.test(line.trim());
                    // Check if line is numbered
                    const isNumbered = /^\d+[\.\):]/.test(line.trim());

                    return (
                      <p
                        key={index}
                        className={[
                          "leading-relaxed",
                          isHeader
                            ? "text-[11px] font-semibold text-kairo-fg-muted uppercase tracking-wider mt-3 first:mt-0"
                            : isNumbered
                            ? "text-sm text-kairo-fg pl-4 border-l-2 border-kairo-accent-500/30"
                            : "text-sm text-kairo-fg",
                        ].join(" ")}
                      >
                        {line}
                      </p>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {bodyLines.map((line, index) => (
                    <p
                      key={index}
                      className="text-sm text-kairo-fg leading-relaxed"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Notes if present */}
          {variant.notes && (
            <section>
              <h3 className="text-[11px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-2">
                Production Notes
              </h3>
              <p className="text-sm text-kairo-fg-muted leading-relaxed bg-kairo-bg-elevated/50 rounded-lg p-3 border border-kairo-border-subtle">
                {variant.notes}
              </p>
            </section>
          )}

          {/* Quality details - only if issues exist */}
          {variant.score !== undefined && variant.score > 0 && variant.score < 80 && (
            <section>
              <h3 className="text-[11px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-2">
                Quality Feedback
              </h3>
              <div className="p-3 rounded-lg bg-kairo-warning-bg/20 border border-kairo-warning-bg/40">
                <p className="text-xs text-kairo-fg-muted">
                  {variant.score >= 60
                    ? "Content is good but could be improved. Consider strengthening the hook or adding more specific proof points."
                    : "Content needs work before publishing. Review the brief and ensure all key points are addressed."}
                </p>
              </div>
            </section>
          )}

          {/* Compact metadata row */}
          <section className="pt-4 border-t border-kairo-border-subtle">
            <div className="flex items-center justify-between text-xs text-kairo-fg-subtle">
              <div className="flex items-center gap-4">
                <span><span className="text-kairo-fg-muted">Channel:</span> {channelLabel}</span>
                <span><span className="text-kairo-fg-muted">Status:</span> <span className="capitalize">{variant.status}</span></span>
              </div>
              <span>{updatedAt}</span>
            </div>
          </section>
        </div>
      </div>

      {/* Sticky footer actions */}
      <div className="flex-shrink-0 px-5 py-4 border-t border-kairo-border-subtle bg-kairo-bg-panel">
        <div className="flex items-center gap-2">
          <KButton
            variant="ghost"
            className="flex-1 justify-center"
            onClick={handleDuplicate}
            data-testid="variant-duplicate-btn"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Duplicate
          </KButton>
          <KButton
            className="flex-1 justify-center"
            onClick={onClose}
          >
            Done
          </KButton>
        </div>
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
            data-testid="variant-drawer-backdrop"
          />

          {/* Desktop drawer (right side sheet) */}
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
              aria-labelledby="variant-drawer-title"
              data-testid="variant-drawer"
            >
              {drawerContent}
            </motion.div>
          )}

          {/* Mobile drawer (bottom sheet with snap points) */}
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
              aria-labelledby="variant-drawer-title"
              data-testid="variant-drawer-mobile"
            >
              {/* Drag handle */}
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

VariantDrawer.displayName = "VariantDrawer";
