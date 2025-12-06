"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { demoBrands, type DemoBrand } from "@/demo/brands";
import { navSections, getSectionFromPath, type NavSection } from "./navigation";
import { TodayIcon, ContentIcon, PatternsIcon, StrategyIcon } from "./NavIcons";
import { ComponentType, SVGProps } from "react";

interface BrandSidebarProps {
  currentBrandId: string;
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

export function BrandSidebar({ currentBrandId }: BrandSidebarProps) {
  const pathname = usePathname();
  const currentSection = getSectionFromPath(pathname);

  return (
    <aside className="w-[240px] shrink-0 bg-kairo-sand-100 border-r border-kairo-border-subtle flex flex-col">
      {/* Nav Content */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {/* Brands Section */}
        <div className="mb-6">
          <h3 className="text-[11px] font-medium text-kairo-ink-500 uppercase tracking-wider mb-3 px-2">
            Brands
          </h3>
          <ul className="space-y-1">
            {demoBrands.map((brand) => (
              <BrandNavItem
                key={brand.id}
                brand={brand}
                isActive={brand.id === currentBrandId}
                currentSection={currentSection}
              />
            ))}
          </ul>
        </div>

        {/* Section Nav */}
        <div>
          <h3 className="text-[11px] font-medium text-kairo-ink-500 uppercase tracking-wider mb-3 px-2">
            Navigation
          </h3>
          <ul className="space-y-1">
            {navSections.map((section) => (
              <SectionNavItem
                key={section.id}
                section={section}
                brandId={currentBrandId}
                isActive={currentSection === section.id}
              />
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}

interface BrandNavItemProps {
  brand: DemoBrand;
  isActive: boolean;
  currentSection: string;
}

function BrandNavItem({ brand, isActive, currentSection }: BrandNavItemProps) {
  const initials = getBrandInitials(brand.name);

  return (
    <li>
      <Link
        href={`/brands/${brand.id}/${currentSection}`}
        className={[
          "group relative flex items-center gap-3 px-3 py-2.5",
          "rounded-(--kairo-radius-md)",
          "kairo-transition-soft",
          "hover:translate-x-px",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-kairo-aqua-500 focus-visible:ring-offset-2 focus-visible:ring-offset-kairo-sand-100",
          isActive
            ? "bg-kairo-surface-plain shadow-soft"
            : "hover:bg-kairo-surface-soft hover:shadow-elevated",
        ].join(" ")}
      >
        {/* Left accent bar for active state */}
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-kairo-aqua-500 rounded-r-full" />
        )}

        {/* Brand avatar */}
        <span
          className={[
            "flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-semibold",
            "kairo-transition-fast",
            isActive
              ? "bg-kairo-aqua-100 text-kairo-aqua-600"
              : "bg-kairo-sand-50 text-kairo-ink-500 group-hover:bg-kairo-aqua-50 group-hover:text-kairo-aqua-600",
          ].join(" ")}
        >
          {initials}
        </span>

        {/* Brand name */}
        <span
          className={[
            "text-[13px] font-medium kairo-transition-fast",
            isActive
              ? "text-kairo-aqua-600"
              : "text-kairo-ink-700 group-hover:text-kairo-ink-900",
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
}

function SectionNavItem({ section, brandId, isActive }: SectionNavItemProps) {
  const Icon = sectionIcons[section.id] || TodayIcon;

  return (
    <li>
      <Link
        href={`/brands/${brandId}/${section.path}`}
        className={[
          "group relative flex items-center gap-3 px-3 py-2",
          "rounded-(--kairo-radius-pill)",
          "kairo-transition-soft",
          "hover:translate-x-px",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-kairo-aqua-500 focus-visible:ring-offset-2 focus-visible:ring-offset-kairo-sand-100",
          isActive
            ? "bg-kairo-aqua-50 text-kairo-aqua-600"
            : "text-kairo-ink-500 hover:bg-kairo-surface-soft hover:text-kairo-ink-700 hover:shadow-soft",
        ].join(" ")}
      >
        {/* Active indicator dot */}
        {isActive && (
          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-1 bg-kairo-aqua-500 rounded-full" />
        )}

        {/* Icon */}
        <Icon
          className={[
            "w-4 h-4 kairo-transition-fast",
            isActive
              ? "text-kairo-aqua-600"
              : "text-kairo-ink-400 group-hover:text-kairo-ink-600",
          ].join(" ")}
        />

        {/* Label */}
        <span
          className={[
            "text-[13px] kairo-transition-fast",
            isActive ? "font-medium" : "font-normal",
          ].join(" ")}
        >
          {section.label}
        </span>
      </Link>
    </li>
  );
}
