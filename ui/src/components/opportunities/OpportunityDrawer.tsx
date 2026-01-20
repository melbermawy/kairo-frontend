"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence, useDragControls, PanInfo } from "framer-motion";
import { KTag } from "@/components/ui";
import type { UIOpportunity, UIBrandSnapshot } from "@/lib/todayAdapter";
import { getPillarName, getPersonaName } from "@/lib/todayAdapter";
import { EvidenceList } from "./EvidenceList";

// ============================================
// TYPES
// ============================================

interface OpportunityDrawerProps {
  opportunity: UIOpportunity | null;
  snapshot: UIBrandSnapshot;
  isOpen: boolean;
  onClose: () => void;
  initialPlatformFilter?: string | null;
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

const DESKTOP_WIDTH = 560; // px

// Type badge variants
const typeLabels: Record<string, string> = {
  trend: "Trend",
  evergreen: "Evergreen",
  competitive: "Competitive",
  campaign: "Campaign",
};

const typeStyles: Record<string, "evergreen" | "campaign" | "danger"> = {
  trend: "campaign",
  evergreen: "evergreen",
  competitive: "danger",
  campaign: "campaign",
};

// ============================================
// MAIN COMPONENT
// ============================================

export function OpportunityDrawer({
  opportunity,
  snapshot,
  isOpen,
  onClose,
  initialPlatformFilter = null,
}: OpportunityDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSnapPoint, setMobileSnapPoint] = useState<keyof typeof SNAP_POINTS>("half");
  const [platformFilter, setPlatformFilter] = useState<string | null>(initialPlatformFilter);
  const dragControls = useDragControls();

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Reset platform filter when drawer opens with new opportunity
  useEffect(() => {
    if (isOpen) {
      setPlatformFilter(initialPlatformFilter);
      setMobileSnapPoint("half");
    }
  }, [isOpen, initialPlatformFilter, opportunity?.id]);

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
      // Small delay to ensure animation has started
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

      // Small drag = stay at current snap
    },
    [mobileSnapPoint, onClose]
  );

  if (!opportunity) return null;

  // Resolve pillar and persona names from snapshot
  const pillarName = getPillarName(snapshot, opportunity.pillarId);
  const personaName = getPersonaName(snapshot, opportunity.personaId);

  // Common drawer content
  const drawerContent = (
    <>
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-kairo-border-subtle bg-kairo-bg-panel">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Score + Type row */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`
                  inline-flex items-center justify-center w-10 h-7 rounded-full text-sm font-bold
                  ${
                    opportunity.score >= 80
                      ? "bg-kairo-score-high-bg text-kairo-score-high-fg"
                      : opportunity.score >= 70
                      ? "bg-kairo-score-medium-bg text-kairo-score-medium-fg"
                      : "bg-kairo-score-low-bg text-kairo-score-low-fg"
                  }
                `}
              >
                {opportunity.score}
              </span>
              <KTag variant={typeStyles[opportunity.type] || "campaign"} className="text-[10px] px-1.5 py-0.5">
                {typeLabels[opportunity.type] || opportunity.type}
              </KTag>
            </div>

            {/* Title */}
            <h2
              id="drawer-title"
              className="text-[16px] font-semibold text-kairo-fg leading-snug"
            >
              {opportunity.title}
            </h2>
          </div>

          {/* Close button */}
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg text-kairo-fg-muted hover:text-kairo-fg hover:bg-kairo-bg-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-kairo-accent-500"
            aria-label="Close drawer"
            data-testid="drawer-close"
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
        data-testid="drawer-content"
      >
        <div className="p-5 space-y-5">
          {/* Angle section */}
          <section>
            <h3 className="text-[11px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-2">
              Angle
            </h3>
            <p className="text-[13px] text-kairo-fg leading-relaxed">
              {opportunity.angle}
            </p>
          </section>

          {/* Why now section */}
          <section>
            <h3 className="text-[11px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-2">
              Why Now
            </h3>
            <p className="text-[13px] text-kairo-fg leading-relaxed">
              {opportunity.whyNow}
            </p>
          </section>

          {/* Brand fit section - shows pillar and persona if available */}
          {(pillarName || personaName) && (
            <section>
              <h3 className="text-[11px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-2">
                Brand Fit
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                {pillarName && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-kairo-accent-500/10 text-[11px] text-kairo-accent-400 border border-kairo-accent-500/20">
                    {pillarName}
                  </span>
                )}
                {pillarName && personaName && (
                  <span className="text-[11px] text-kairo-fg-subtle">for</span>
                )}
                {personaName && (
                  <span className="text-[12px] text-kairo-fg font-medium">
                    {personaName}
                  </span>
                )}
              </div>
            </section>
          )}

          {/* Evidence section */}
          {opportunity.evidencePreview.length > 0 && (
            <section>
              <h3 className="text-[11px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-3">
                Evidence
              </h3>
              <EvidenceList
                evidence={opportunity.evidencePreview}
                initialPlatformFilter={platformFilter}
                onPlatformFilterChange={setPlatformFilter}
              />
            </section>
          )}
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
            data-testid="drawer-backdrop"
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
              aria-labelledby="drawer-title"
              data-testid="opportunity-drawer"
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
              aria-labelledby="drawer-title"
              data-testid="opportunity-drawer-mobile"
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

OpportunityDrawer.displayName = "OpportunityDrawer";
