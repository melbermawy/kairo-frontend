"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { BrandCore } from "@/contracts";
import { navSections, getSectionFromPath, type NavSection } from "./navigation";
import { TodayIcon, ContentIcon, PatternsIcon, StrategyIcon } from "./NavIcons";
import { ComponentType, SVGProps } from "react";

interface BrandSidebarProps {
  currentBrandId: string;
  brands: BrandCore[];
  onNavigate?: () => void;
  onBrandCreated?: (brand: BrandCore) => void;
}

const sectionIcons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  today: TodayIcon,
  packages: ContentIcon,
  patterns: PatternsIcon,
  strategy: StrategyIcon,
};

function getBrandInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function BrandSidebar({ currentBrandId, brands, onNavigate, onBrandCreated }: BrandSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentSection = getSectionFromPath(pathname);
  const [isCreating, setIsCreating] = useState(false);

  const handleAddBrand = useCallback(async () => {
    if (isCreating) return;
    setIsCreating(true);

    try {
      const newBrand = await api.createBrand({ name: "New Brand" });
      onBrandCreated?.(newBrand);
      router.push(`/brands/${newBrand.id}/onboarding`);
    } catch (err) {
      console.error("Failed to create brand:", err);
    } finally {
      setIsCreating(false);
    }
  }, [isCreating, onBrandCreated, router]);

  return (
    <nav className="flex-1 px-2 py-4" data-testid="brand-sidebar">
        {/* Brands Section */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2 px-2">
            <h3 className="text-[10px] font-medium text-kairo-fg-subtle uppercase tracking-wider">
              Brands
            </h3>
            <button
              onClick={handleAddBrand}
              disabled={isCreating}
              className="
                p-1 rounded-md text-kairo-fg-subtle hover:text-kairo-fg
                hover:bg-kairo-bg-hover transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              aria-label="Add brand"
              title="Add brand"
            >
              {isCreating ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </button>
          </div>
          <ul className="space-y-0.5">
            {brands.map((brand) => (
              <BrandNavItem
                key={brand.id}
                brand={brand}
                isActive={brand.id === currentBrandId}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        </div>

        {/* Section Nav */}
        <div>
          <h3 className="text-[10px] font-medium text-kairo-fg-subtle uppercase tracking-wider mb-2 px-2">
            Navigation
          </h3>
          <ul className="space-y-0.5">
            {navSections.map((section) => (
              <SectionNavItem
                key={section.id}
                section={section}
                brandId={currentBrandId}
                isActive={currentSection === section.id}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        </div>
    </nav>
  );
}

interface BrandNavItemProps {
  brand: BrandCore;
  isActive: boolean;
  onNavigate?: () => void;
}

function BrandNavItem({ brand, isActive, onNavigate }: BrandNavItemProps) {
  const initials = getBrandInitials(brand.name);

  return (
    <li>
      <Link
        href={`/brands/${brand.id}/strategy`}
        onClick={onNavigate}
        className={[
          "group relative flex items-center gap-2.5 px-2 py-2 min-h-[40px]",
          "rounded-md",
          "kairo-transition-fast",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-kairo-accent-500 focus-visible:ring-inset",
          isActive
            ? "bg-kairo-bg-hover"
            : "hover:bg-kairo-bg-hover/50",
        ].join(" ")}
        data-testid="brand-nav-item"
        data-active={isActive}
      >
        {/* Left accent bar for active state */}
        {isActive && (
          <span
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-kairo-accent-500 rounded-r-full"
            data-testid="nav-active-indicator"
          />
        )}

        {/* Brand avatar */}
        <span
          className={[
            "flex items-center justify-center w-6 h-6 rounded-md text-[10px] font-semibold",
            "kairo-transition-fast",
            isActive
              ? "bg-kairo-accent-500/20 text-kairo-accent-400"
              : "bg-kairo-bg-elevated text-kairo-fg-muted group-hover:text-kairo-fg",
          ].join(" ")}
        >
          {initials}
        </span>

        {/* Brand name */}
        <span
          className={[
            "text-[13px] kairo-transition-fast",
            isActive
              ? "font-medium text-kairo-fg"
              : "text-kairo-fg-muted group-hover:text-kairo-fg",
          ].join(" ")}
        >
          {brand.name}
        </span>
      </Link>
    </li>
  );
}

interface SectionNavItemProps {
  section: NavSection;
  brandId: string;
  isActive: boolean;
  onNavigate?: () => void;
}

function SectionNavItem({ section, brandId, isActive, onNavigate }: SectionNavItemProps) {
  const Icon = sectionIcons[section.id] || TodayIcon;

  return (
    <li>
      <Link
        href={`/brands/${brandId}/${section.path}`}
        onClick={onNavigate}
        className={[
          "group relative flex items-center gap-2.5 px-2 py-2 min-h-[40px]",
          "rounded-md",
          "kairo-transition-fast",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-kairo-accent-500 focus-visible:ring-inset",
          isActive
            ? "bg-kairo-bg-hover"
            : "hover:bg-kairo-bg-hover/50",
        ].join(" ")}
        data-testid="section-nav-item"
        data-active={isActive}
      >
        {/* Left accent bar for active state */}
        {isActive && (
          <span
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-kairo-accent-500 rounded-r-full"
            data-testid="nav-active-indicator"
          />
        )}

        {/* Icon */}
        <Icon
          className={[
            "w-4 h-4 kairo-transition-fast",
            isActive
              ? "text-kairo-accent-400"
              : "text-kairo-fg-muted group-hover:text-kairo-fg",
          ].join(" ")}
        />

        {/* Label */}
        <span
          className={[
            "text-[13px] kairo-transition-fast",
            isActive
              ? "font-medium text-kairo-fg"
              : "text-kairo-fg-muted group-hover:text-kairo-fg",
          ].join(" ")}
        >
          {section.label}
        </span>
      </Link>
    </li>
  );
}

BrandSidebar.displayName = "BrandSidebar";
