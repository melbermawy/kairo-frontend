// src/components/opportunities/__tests__/opportunityDrawer.test.ts
// Tests for the opportunity drawer and evidence workspace

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Opportunity Drawer", () => {
  describe("Desktop drawer structure", () => {
    it("should have fixed width for desktop", () => {
      const drawerPath = path.join(__dirname, "../OpportunityDrawer.tsx");
      const content = fs.readFileSync(drawerPath, "utf-8");

      // Desktop drawer should have fixed width
      expect(content).toContain("DESKTOP_WIDTH = 560");
    });

    it("should have proper dialog ARIA attributes", () => {
      const drawerPath = path.join(__dirname, "../OpportunityDrawer.tsx");
      const content = fs.readFileSync(drawerPath, "utf-8");

      expect(content).toContain('role="dialog"');
      expect(content).toContain('aria-modal="true"');
      expect(content).toContain('aria-labelledby="drawer-title"');
    });

    it("should have close button with aria-label", () => {
      const drawerPath = path.join(__dirname, "../OpportunityDrawer.tsx");
      const content = fs.readFileSync(drawerPath, "utf-8");

      expect(content).toContain('aria-label="Close drawer"');
      expect(content).toContain('data-testid="drawer-close"');
    });

    it("should have data-testid for testing", () => {
      const drawerPath = path.join(__dirname, "../OpportunityDrawer.tsx");
      const content = fs.readFileSync(drawerPath, "utf-8");

      expect(content).toContain('data-testid="opportunity-drawer"');
      expect(content).toContain('data-testid="drawer-backdrop"');
      expect(content).toContain('data-testid="drawer-content"');
      expect(content).toContain('data-testid="build-concept-btn"');
      expect(content).toContain('data-testid="create-package-btn"');
    });
  });

  describe("Mobile bottom sheet", () => {
    it("should have snap points configuration", () => {
      const drawerPath = path.join(__dirname, "../OpportunityDrawer.tsx");
      const content = fs.readFileSync(drawerPath, "utf-8");

      // Should have snap points defined
      expect(content).toContain("SNAP_POINTS");
      expect(content).toContain("collapsed");
      expect(content).toContain("half");
      expect(content).toContain("full");
    });

    it("should have mobile drawer test id", () => {
      const drawerPath = path.join(__dirname, "../OpportunityDrawer.tsx");
      const content = fs.readFileSync(drawerPath, "utf-8");

      expect(content).toContain('data-testid="opportunity-drawer-mobile"');
    });

    it("should support drag gestures", () => {
      const drawerPath = path.join(__dirname, "../OpportunityDrawer.tsx");
      const content = fs.readFileSync(drawerPath, "utf-8");

      expect(content).toContain("useDragControls");
      expect(content).toContain("handleDragEnd");
      expect(content).toContain('drag="y"');
    });

    it("should have drag handle element", () => {
      const drawerPath = path.join(__dirname, "../OpportunityDrawer.tsx");
      const content = fs.readFileSync(drawerPath, "utf-8");

      // Drag handle visual indicator
      expect(content).toContain("w-10 h-1 rounded-full");
      expect(content).toContain("cursor-grab");
    });
  });

  describe("Keyboard and accessibility", () => {
    it("should handle escape key to close", () => {
      const drawerPath = path.join(__dirname, "../OpportunityDrawer.tsx");
      const content = fs.readFileSync(drawerPath, "utf-8");

      expect(content).toContain('e.key === "Escape"');
      expect(content).toContain("onClose()");
    });

    it("should lock body scroll when open", () => {
      const drawerPath = path.join(__dirname, "../OpportunityDrawer.tsx");
      const content = fs.readFileSync(drawerPath, "utf-8");

      expect(content).toContain('document.body.style.overflow = "hidden"');
      expect(content).toContain('document.body.style.overflow = ""');
    });

    it("should focus close button on open (focus trap)", () => {
      const drawerPath = path.join(__dirname, "../OpportunityDrawer.tsx");
      const content = fs.readFileSync(drawerPath, "utf-8");

      expect(content).toContain("closeButtonRef");
      expect(content).toContain("closeButtonRef.current?.focus()");
    });
  });

  describe("Evidence list with platform filtering", () => {
    it("should use EvidenceList component", () => {
      const drawerPath = path.join(__dirname, "../OpportunityDrawer.tsx");
      const content = fs.readFileSync(drawerPath, "utf-8");

      expect(content).toContain("EvidenceList");
      expect(content).toContain("initialPlatformFilter");
      expect(content).toContain("onPlatformFilterChange");
    });

    it("should accept initialPlatformFilter prop", () => {
      const drawerPath = path.join(__dirname, "../OpportunityDrawer.tsx");
      const content = fs.readFileSync(drawerPath, "utf-8");

      expect(content).toContain("initialPlatformFilter?: EvidencePlatform | null");
    });
  });

  describe("Token compliance (no hardcoded colors)", () => {
    it("should not use hardcoded hex colors", () => {
      const drawerPath = path.join(__dirname, "../OpportunityDrawer.tsx");
      const content = fs.readFileSync(drawerPath, "utf-8");

      // Should not have hardcoded hex colors (except black/white for platform badges)
      const hexPattern = /#[0-9A-Fa-f]{3,6}(?!\w)/g;
      const matches = content.match(hexPattern) || [];

      // Filter out allowed hex values
      const disallowed = matches.filter(m => !["#000", "#000000", "#fff", "#ffffff"].includes(m.toLowerCase()));
      expect(disallowed).toEqual([]);
    });

    it("should use kairo token classes", () => {
      const drawerPath = path.join(__dirname, "../OpportunityDrawer.tsx");
      const content = fs.readFileSync(drawerPath, "utf-8");

      // Should use semantic bg tokens
      expect(content).toContain("bg-kairo-bg-panel");
      expect(content).toContain("bg-kairo-bg-card");

      // Should use semantic fg tokens
      expect(content).toContain("text-kairo-fg");
      expect(content).toContain("text-kairo-fg-muted");
      expect(content).toContain("text-kairo-fg-subtle");

      // Should use border tokens
      expect(content).toContain("border-kairo-border-subtle");
    });

    it("should NOT use deprecated ink/sand tokens", () => {
      const drawerPath = path.join(__dirname, "../OpportunityDrawer.tsx");
      const content = fs.readFileSync(drawerPath, "utf-8");

      expect(content).not.toContain("kairo-ink-");
      expect(content).not.toContain("kairo-sand-");
    });
  });
});

describe("Evidence List", () => {
  it("should have platform filter functionality", () => {
    const listPath = path.join(__dirname, "../EvidenceList.tsx");
    const content = fs.readFileSync(listPath, "utf-8");

    expect(content).toContain("PlatformBadgesRow");
    expect(content).toContain("platformFilter");
    expect(content).toContain("filteredEvidence");
  });

  it("should have data-testid for testing", () => {
    const listPath = path.join(__dirname, "../EvidenceList.tsx");
    const content = fs.readFileSync(listPath, "utf-8");

    expect(content).toContain('data-testid="evidence-list"');
  });
});

describe("Evidence Tile Expanded", () => {
  it("should support expand/collapse toggle", () => {
    const tilePath = path.join(__dirname, "../EvidenceTileExpanded.tsx");
    const content = fs.readFileSync(tilePath, "utf-8");

    expect(content).toContain("isExpanded");
    expect(content).toContain("onToggle");
    expect(content).toContain("AnimatePresence");
  });

  it("should show full caption when expanded", () => {
    const tilePath = path.join(__dirname, "../EvidenceTileExpanded.tsx");
    const content = fs.readFileSync(tilePath, "utf-8");

    expect(content).toContain("Full Caption");
  });

  it("should have open source link", () => {
    const tilePath = path.join(__dirname, "../EvidenceTileExpanded.tsx");
    const content = fs.readFileSync(tilePath, "utf-8");

    expect(content).toContain("Open source");
    expect(content).toContain("canonical_url");
    expect(content).toContain('target="_blank"');
    expect(content).toContain('rel="noopener noreferrer"');
  });

  it("should have data-testid for testing", () => {
    const tilePath = path.join(__dirname, "../EvidenceTileExpanded.tsx");
    const content = fs.readFileSync(tilePath, "utf-8");

    expect(content).toContain('data-testid="evidence-tile"');
  });
});

describe("Platform Badges Row", () => {
  it("should compute platform counts", () => {
    const badgesPath = path.join(__dirname, "../PlatformBadgesRow.tsx");
    const content = fs.readFileSync(badgesPath, "utf-8");

    expect(content).toContain("platformCounts");
    expect(content).toContain("useMemo");
  });

  it("should support click filtering", () => {
    const badgesPath = path.join(__dirname, "../PlatformBadgesRow.tsx");
    const content = fs.readFileSync(badgesPath, "utf-8");

    expect(content).toContain("onPlatformClick");
    expect(content).toContain("activePlatform");
    expect(content).toContain('aria-pressed');
  });

  it("should have accessibility attributes", () => {
    const badgesPath = path.join(__dirname, "../PlatformBadgesRow.tsx");
    const content = fs.readFileSync(badgesPath, "utf-8");

    expect(content).toContain('role="group"');
    expect(content).toContain('aria-label="Filter by platform"');
  });

  it("should have data-testid for each platform badge", () => {
    const badgesPath = path.join(__dirname, "../PlatformBadgesRow.tsx");
    const content = fs.readFileSync(badgesPath, "utf-8");

    expect(content).toContain('data-testid={`platform-badge-${platform}`}');
  });
});

describe("Opportunity Card V2 Platform Badges", () => {
  it("should have platform badges with counts", () => {
    const cardPath = path.join(__dirname, "../OpportunityCardV2.tsx");
    const content = fs.readFileSync(cardPath, "utf-8");

    expect(content).toContain("platformCounts");
    expect(content).toContain('data-testid="platform-badges"');
  });

  it("should support onPlatformClick callback", () => {
    const cardPath = path.join(__dirname, "../OpportunityCardV2.tsx");
    const content = fs.readFileSync(cardPath, "utf-8");

    expect(content).toContain("onPlatformClick?: (platform: EvidencePlatform) => void");
    expect(content).toContain("handlePlatformClick");
    expect(content).toContain("stopPropagation");
  });

  it("should have data-testid for card", () => {
    const cardPath = path.join(__dirname, "../OpportunityCardV2.tsx");
    const content = fs.readFileSync(cardPath, "utf-8");

    expect(content).toContain('data-testid="opportunity-card"');
  });

  it("should NOT use deprecated ink/sand tokens", () => {
    const cardPath = path.join(__dirname, "../OpportunityCardV2.tsx");
    const content = fs.readFileSync(cardPath, "utf-8");

    expect(content).not.toContain("kairo-ink-");
    expect(content).not.toContain("kairo-sand-");
  });
});

describe("TodayBoardClient URL State", () => {
  it("should use URL search params for drawer state", () => {
    const clientPath = path.join(__dirname, "../../../app/brands/[brandId]/today/TodayBoardClient.tsx");
    const content = fs.readFileSync(clientPath, "utf-8");

    expect(content).toContain("useSearchParams");
    expect(content).toContain("useRouter");
    expect(content).toContain('searchParams.get("opp")');
  });

  it("should update URL when drawer opens", () => {
    const clientPath = path.join(__dirname, "../../../app/brands/[brandId]/today/TodayBoardClient.tsx");
    const content = fs.readFileSync(clientPath, "utf-8");

    expect(content).toContain("updateUrl");
    expect(content).toContain('params.set("opp"');
    expect(content).toContain("router.replace");
  });

  it("should clear URL when drawer closes", () => {
    const clientPath = path.join(__dirname, "../../../app/brands/[brandId]/today/TodayBoardClient.tsx");
    const content = fs.readFileSync(clientPath, "utf-8");

    expect(content).toContain('params.delete("opp")');
    expect(content).toContain("updateUrl(null)");
  });

  it("should open drawer from URL on mount", () => {
    const clientPath = path.join(__dirname, "../../../app/brands/[brandId]/today/TodayBoardClient.tsx");
    const content = fs.readFileSync(clientPath, "utf-8");

    expect(content).toContain("useEffect");
    expect(content).toContain('searchParams.get("opp")');
    expect(content).toContain("setIsDrawerOpen(true)");
  });

  it("should pass initialPlatformFilter to drawer", () => {
    const clientPath = path.join(__dirname, "../../../app/brands/[brandId]/today/TodayBoardClient.tsx");
    const content = fs.readFileSync(clientPath, "utf-8");

    expect(content).toContain("initialPlatformFilter={initialPlatformFilter}");
    expect(content).toContain("handlePlatformClick");
  });

  it("should have data-testid for opportunities grid", () => {
    const clientPath = path.join(__dirname, "../../../app/brands/[brandId]/today/TodayBoardClient.tsx");
    const content = fs.readFileSync(clientPath, "utf-8");

    expect(content).toContain('data-testid="opportunities-grid"');
  });
});
