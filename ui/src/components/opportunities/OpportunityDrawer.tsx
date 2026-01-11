"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useDragControls, PanInfo } from "framer-motion";
import Link from "next/link";
import { KButton, KTag } from "@/components/ui";
import { mockApi } from "@/lib/mockApi";
import type { OpportunityWithEvidence, OpportunityLifecycle, EvidencePlatform } from "@/lib/mockApi";
import { LifecycleSparkline } from "./Sparkline";
import { EvidenceList } from "./EvidenceList";

// ============================================
// TYPES
// ============================================

interface OpportunityDrawerProps {
  opportunity: OpportunityWithEvidence | null;
  isOpen: boolean;
  onClose: () => void;
  brandId: string;
  initialPlatformFilter?: EvidencePlatform | null;
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

// Lifecycle badge colors
const lifecycleConfig: Record<
  OpportunityLifecycle,
  { label: string; className: string }
> = {
  seed: { label: "Seed", className: "bg-kairo-lifecycle-seed-bg text-kairo-lifecycle-seed-fg" },
  rising: { label: "Rising", className: "bg-kairo-lifecycle-rising-bg text-kairo-lifecycle-rising-fg" },
  peaking: { label: "Peaking", className: "bg-kairo-lifecycle-peaking-bg text-kairo-lifecycle-peaking-fg" },
  declining: { label: "Declining", className: "bg-kairo-lifecycle-declining-bg text-kairo-lifecycle-declining-fg" },
  evergreen: { label: "Evergreen", className: "bg-kairo-lifecycle-evergreen-bg text-kairo-lifecycle-evergreen-fg" },
  active: { label: "Active", className: "bg-kairo-lifecycle-active-bg text-kairo-lifecycle-active-fg" },
};

// Type badge variants
const typeLabels: Record<string, string> = {
  trend: "Trend",
  evergreen: "Evergreen",
  competitive: "Competitive",
};

const typeStyles: Record<string, "evergreen" | "campaign" | "danger"> = {
  trend: "campaign",
  evergreen: "evergreen",
  competitive: "danger",
};

// ============================================
// MAIN COMPONENT
// ============================================

export function OpportunityDrawer({
  opportunity,
  isOpen,
  onClose,
  brandId,
  initialPlatformFilter = null,
}: OpportunityDrawerProps) {
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSnapPoint, setMobileSnapPoint] = useState<keyof typeof SNAP_POINTS>("half");
  const [platformFilter, setPlatformFilter] = useState<EvidencePlatform | null>(initialPlatformFilter);
  const [isCreatingPackage, setIsCreatingPackage] = useState(false);
  const dragControls = useDragControls();

  // Handle quick "Create Package" action
  // Note: In mock mode, we navigate to the packages list since client-side
  // mutations don't persist to server components. In production with a real
  // API, this would navigate to the specific package.
  const handleCreatePackage = useCallback(async () => {
    if (!opportunity || isCreatingPackage) return;
    setIsCreatingPackage(true);
    try {
      await mockApi.createPackageFromOpportunity(brandId, opportunity.id);
      onClose();
      // Navigate to packages list - in mock mode the specific package won't
      // persist to the server, but this demonstrates the flow
      router.push(`/brands/${brandId}/packages`);
    } catch (err) {
      console.error("Failed to create package:", err);
    } finally {
      setIsCreatingPackage(false);
    }
  }, [brandId, opportunity, isCreatingPackage, onClose, router]);

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

  const lifecycle = opportunity.lifecycle || "active";
  const lifecycleInfo = lifecycleConfig[lifecycle];

  // Common drawer content
  const drawerContent = (
    <>
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-kairo-border-subtle bg-kairo-bg-panel">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Score + Type + Lifecycle row */}
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
              <KTag variant={typeStyles[opportunity.type]} className="text-[10px] px-1.5 py-0.5">
                {typeLabels[opportunity.type]}
              </KTag>
              <span
                className={`
                  inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium
                  ${lifecycleInfo.className}
                `}
              >
                <LifecycleSparkline lifecycle={lifecycle} />
                {lifecycleInfo.label}
              </span>
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
          {/* Why now section */}
          <section>
            <h3 className="text-[11px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-2">
              Why Now
            </h3>
            {opportunity.why_now_summary && (
              <p className="text-[13px] text-kairo-fg leading-relaxed mb-2 font-medium">
                {opportunity.why_now_summary}
              </p>
            )}
            <ul className="space-y-1.5">
              {opportunity.why_now.map((reason, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-[12px] text-kairo-fg-muted"
                >
                  <span className="shrink-0 w-1 h-1 mt-1.5 rounded-full bg-kairo-accent-400" />
                  {reason}
                </li>
              ))}
            </ul>
          </section>

          {/* Trend kernel / signal */}
          {opportunity.trend_kernel && (
            <section>
              <h3 className="text-[11px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-2">
                Trend Signal
              </h3>
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-kairo-bg-card border border-kairo-border-subtle text-[12px] text-kairo-fg">
                {opportunity.trend_kernel.kind === "audio" && (
                  <svg className="w-4 h-4 text-kairo-fg-muted" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                )}
                {opportunity.trend_kernel.kind === "hashtag" && (
                  <span className="text-kairo-fg-muted font-bold">#</span>
                )}
                {opportunity.trend_kernel.kind === "phrase" && (
                  <svg className="w-4 h-4 text-kairo-fg-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                )}
                <span className="font-medium">{opportunity.trend_kernel.value}</span>
                <span className="text-kairo-fg-subtle capitalize">
                  ({opportunity.trend_kernel.kind})
                </span>
              </div>
            </section>
          )}

          {/* Brand fit */}
          <section>
            <h3 className="text-[11px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-2">
              Brand Fit
            </h3>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-kairo-accent-500/10 text-[11px] text-kairo-accent-400 border border-kairo-accent-500/20">
                {opportunity.brand_fit.pillar}
              </span>
              <span className="text-[11px] text-kairo-fg-subtle">for</span>
              <span className="text-[12px] text-kairo-fg font-medium">
                {opportunity.brand_fit.persona}
              </span>
            </div>
            <p className="text-[12px] text-kairo-fg-muted italic leading-relaxed">
              &ldquo;{opportunity.brand_fit.voice_reason}&rdquo;
            </p>
          </section>

          {/* Evidence section */}
          <section>
            <h3 className="text-[11px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-3">
              Evidence
            </h3>
            <EvidenceList
              evidence={opportunity.evidence}
              initialPlatformFilter={platformFilter}
              onPlatformFilterChange={setPlatformFilter}
            />
          </section>
        </div>
      </div>

      {/* Sticky footer CTA */}
      <div className="flex-shrink-0 px-5 py-4 border-t border-kairo-border-subtle bg-kairo-bg-panel space-y-2">
        {/* Primary: Build Concept - navigate to concept builder */}
        <Link
          href={`/brands/${brandId}/content/concepts/new?opportunityId=${opportunity.id}`}
          className="block"
        >
          <KButton className="w-full justify-center" data-testid="build-concept-btn">
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
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            Build Concept
          </KButton>
        </Link>

        {/* Secondary: Quick Create Package */}
        <KButton
          variant="secondary"
          className="w-full justify-center"
          onClick={handleCreatePackage}
          disabled={isCreatingPackage}
          data-testid="create-package-btn"
        >
          {isCreatingPackage ? (
            <>
              <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating...
            </>
          ) : (
            <>
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Package
            </>
          )}
        </KButton>

        <p className="text-[11px] text-kairo-fg-subtle text-center">
          Build a concept first or create a package directly
        </p>
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
