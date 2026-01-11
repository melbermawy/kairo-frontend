// src/components/layout/__tests__/shellResponsiveness.test.ts
// Tests for shell responsiveness and dark-first layout

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Shell Responsiveness", () => {
  describe("Mobile sidebar toggle", () => {
    it("should have mobile sidebar toggle button in TopBar", () => {
      const topBarPath = path.join(__dirname, "../TopBar.tsx");
      const content = fs.readFileSync(topBarPath, "utf-8");

      // Check for mobile hamburger toggle
      expect(content).toContain('data-testid="mobile-sidebar-toggle"');
      expect(content).toContain("md:hidden");
      expect(content).toContain("onToggleMobileSidebar");
    });

    it("should have proper ARIA attributes for mobile toggle", () => {
      const topBarPath = path.join(__dirname, "../TopBar.tsx");
      const content = fs.readFileSync(topBarPath, "utf-8");

      expect(content).toContain('aria-label=');
      expect(content).toContain('aria-expanded=');
    });
  });

  describe("Dark-first canvas", () => {
    it("should not have bg-white or light canvas in AppShell", () => {
      const appShellPath = path.join(__dirname, "../AppShell.tsx");
      const content = fs.readFileSync(appShellPath, "utf-8");

      // Should not have light backgrounds
      expect(content).not.toContain("bg-white");
      expect(content).not.toContain("bg-kairo-aqua-50");
      expect(content).not.toContain("bg-kairo-sand-");

      // Should have dark background
      expect(content).toContain("bg-kairo-bg-app");
    });

    it("should not have bg-white in TopBar", () => {
      const topBarPath = path.join(__dirname, "../TopBar.tsx");
      const content = fs.readFileSync(topBarPath, "utf-8");

      expect(content).not.toContain('className="bg-white');
      expect(content).not.toContain("bg-kairo-aqua-500");
      expect(content).not.toContain("bg-kairo-aqua-600");
    });

    it("should use dark surface tokens in header", () => {
      const topBarPath = path.join(__dirname, "../TopBar.tsx");
      const content = fs.readFileSync(topBarPath, "utf-8");

      // Header should use elevated surface, not accent
      expect(content).toContain("bg-kairo-bg-elevated");
    });

    it("globals.css should define dark-first tokens", () => {
      const globalsPath = path.join(__dirname, "../../../app/globals.css");
      const content = fs.readFileSync(globalsPath, "utf-8");

      // Dark color scheme
      expect(content).toContain("color-scheme: dark");

      // Dark background tokens
      expect(content).toContain("--kairo-color-bg-app");
      expect(content).toContain("--kairo-color-bg-panel");
      expect(content).toContain("--kairo-color-bg-card");
      expect(content).toContain("--kairo-color-bg-elevated");

      // Body should use dark background
      expect(content).toContain("background-color: var(--kairo-color-bg-app)");
    });
  });

  describe("Container max-width", () => {
    it("should have max-width container in AppShell main content", () => {
      const appShellPath = path.join(__dirname, "../AppShell.tsx");
      const content = fs.readFileSync(appShellPath, "utf-8");

      // Should have max-width discipline
      expect(content).toContain("max-w-[1200px]");
      expect(content).toContain("mx-auto");

      // Should have responsive padding
      expect(content).toContain("px-4");
      expect(content).toContain("sm:px-6");
      expect(content).toContain("lg:px-8");
    });
  });

  describe("Layout structure", () => {
    it("should have proper sidebar structure in AppShell", () => {
      const appShellPath = path.join(__dirname, "../AppShell.tsx");
      const content = fs.readFileSync(appShellPath, "utf-8");

      // Desktop sidebar should be hidden on mobile
      expect(content).toContain("hidden md:flex");

      // Mobile sidebar should be hidden on desktop
      expect(content).toContain("md:hidden");

      // Sidebar should have scroll capability
      expect(content).toContain("overflow-y-auto");
    });

    it("should have body scroll lock for mobile sidebar", () => {
      const appShellPath = path.join(__dirname, "../AppShell.tsx");
      const content = fs.readFileSync(appShellPath, "utf-8");

      // Should lock body scroll when mobile sidebar is open
      expect(content).toContain('document.body.style.overflow = "hidden"');
      expect(content).toContain('document.body.style.overflow = ""');
    });

    it("should handle escape key for mobile sidebar", () => {
      const appShellPath = path.join(__dirname, "../AppShell.tsx");
      const content = fs.readFileSync(appShellPath, "utf-8");

      expect(content).toContain('e.key === "Escape"');
      expect(content).toContain("handleCloseMobileSidebar");
    });
  });

  describe("Header responsiveness", () => {
    it("should have compact header height", () => {
      const appShellPath = path.join(__dirname, "../AppShell.tsx");
      const content = fs.readFileSync(appShellPath, "utf-8");

      // Header height should be defined
      expect(content).toContain("HEADER_HEIGHT = 48");
    });

    it("should have fixed header", () => {
      const topBarPath = path.join(__dirname, "../TopBar.tsx");
      const content = fs.readFileSync(topBarPath, "utf-8");

      expect(content).toContain("fixed top-0");
      expect(content).toContain("h-12");
      expect(content).toContain("z-50");
    });
  });

  describe("BrandSidebar", () => {
    it("should not have fixed positioning (handled by AppShell)", () => {
      const sidebarPath = path.join(__dirname, "../BrandSidebar.tsx");
      const content = fs.readFileSync(sidebarPath, "utf-8");

      // BrandSidebar should be a simple nav, not fixed
      expect(content).not.toContain('className="fixed');
      expect(content).toContain('data-testid="brand-sidebar"');
    });

    it("should have accent indicator for active nav items", () => {
      const sidebarPath = path.join(__dirname, "../BrandSidebar.tsx");
      const content = fs.readFileSync(sidebarPath, "utf-8");

      // Active items should have accent indicator
      expect(content).toContain('data-testid="nav-active-indicator"');
      expect(content).toContain("bg-kairo-accent-500");
    });

    it("should NOT use old glass pill styling", () => {
      const sidebarPath = path.join(__dirname, "../BrandSidebar.tsx");
      const content = fs.readFileSync(sidebarPath, "utf-8");

      // Should not have glass/pill styling
      expect(content).not.toContain("rounded-2xl");
      expect(content).not.toContain("backdrop-blur");
      expect(content).not.toContain("bg-white/10");
      expect(content).not.toContain("bg-white/5");
      expect(content).not.toContain("shadow-[inset_");
    });

    it("should use flat list styling with proper heights", () => {
      const sidebarPath = path.join(__dirname, "../BrandSidebar.tsx");
      const content = fs.readFileSync(sidebarPath, "utf-8");

      // Should have modern flat nav styling
      expect(content).toContain("min-h-[40px]");
      expect(content).toContain("rounded-md");
      expect(content).toContain("bg-kairo-bg-hover");
    });

    it("should use fg token tiers for text", () => {
      const sidebarPath = path.join(__dirname, "../BrandSidebar.tsx");
      const content = fs.readFileSync(sidebarPath, "utf-8");

      // Section headings should use subtle text
      expect(content).toContain("text-kairo-fg-subtle");

      // Nav labels should use muted (inactive) and fg (active)
      expect(content).toContain("text-kairo-fg-muted");
      expect(content).toContain("text-kairo-fg");
    });
  });
});

describe("Focus Strip Styling", () => {
  it("should use proper fg token tiers", () => {
    const focusStripPath = path.join(__dirname, "../../today/TodayFocusStrip.tsx");
    const content = fs.readFileSync(focusStripPath, "utf-8");

    // Should use all three tiers correctly
    expect(content).toContain("text-kairo-fg"); // Primary content
    expect(content).toContain("text-kairo-fg-muted"); // Supporting text
    expect(content).toContain("text-kairo-fg-subtle"); // Label/helper text
  });

  it("should NOT use washed-out legacy color tokens", () => {
    const focusStripPath = path.join(__dirname, "../../today/TodayFocusStrip.tsx");
    const content = fs.readFileSync(focusStripPath, "utf-8");

    // Should not have legacy light-mode tokens
    expect(content).not.toContain("kairo-ink-");
    expect(content).not.toContain("kairo-sand-");
    expect(content).not.toContain("from-kairo-sand");
    expect(content).not.toContain("to-kairo-aqua");
  });

  it("should use dark surface for background", () => {
    const focusStripPath = path.join(__dirname, "../../today/TodayFocusStrip.tsx");
    const content = fs.readFileSync(focusStripPath, "utf-8");

    // Should use card surface, not gradient
    expect(content).toContain("bg-kairo-bg-card");
    expect(content).toContain("border-kairo-border-subtle");
  });

  it("should have readable accent for the count number", () => {
    const focusStripPath = path.join(__dirname, "../../today/TodayFocusStrip.tsx");
    const content = fs.readFileSync(focusStripPath, "utf-8");

    // Count should use readable accent, not washed out color
    expect(content).toContain("text-kairo-accent-400");
  });

  it("should have data-testid for testing", () => {
    const focusStripPath = path.join(__dirname, "../../today/TodayFocusStrip.tsx");
    const content = fs.readFileSync(focusStripPath, "utf-8");

    expect(content).toContain('data-testid="focus-strip"');
  });
});
