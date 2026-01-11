"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PackageRow } from "./PackageRow";
import { KButton } from "@/components/ui";
import { mockApi, type ContentPackage } from "@/lib/mockApi";

// Filter status - using quality band as proxy since spec doesn't have status field
type FilterStatus = "all" | "good" | "partial" | "needs_work";

interface PackagesTableProps {
  packages: ContentPackage[];
  brandId: string;
}

const filterTabs: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "good", label: "Good" },
  { value: "partial", label: "In Progress" },
  { value: "needs_work", label: "Needs Work" },
];

export function PackagesTable({ packages, brandId }: PackagesTableProps) {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");

  const filteredPackages =
    activeFilter === "all"
      ? packages
      : packages.filter((p) => p.quality.band === activeFilter);

  // Count packages per quality band for the filter badges
  const bandCounts = packages.reduce(
    (acc, pkg) => {
      acc[pkg.quality.band] = (acc[pkg.quality.band] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="relative flex items-center gap-1 p-1 bg-kairo-sand-50 rounded-(--kairo-radius-md) w-fit">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.value;
          const count = tab.value === "all" ? packages.length : (bandCounts[tab.value] || 0);

          return (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={[
                "relative inline-flex items-center gap-1.5",
                "px-3 py-1.5",
                "rounded-(--kairo-radius-sm)",
                "text-xs font-medium",
                "transition-colors duration-200",
                "z-10",
                isActive
                  ? "text-kairo-ink-900"
                  : "text-kairo-ink-500 hover:text-kairo-ink-700",
              ].join(" ")}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-kairo-surface-plain rounded-(--kairo-radius-sm) shadow-soft"
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                  }}
                  style={{ zIndex: -1 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
              <span
                className={[
                  "relative z-10 text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center transition-colors duration-200",
                  isActive
                    ? "bg-kairo-aqua-50 text-kairo-aqua-600"
                    : "bg-kairo-sand-100 text-kairo-ink-400",
                ].join(" ")}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Column header - desktop only */}
      <div className="hidden md:flex items-center gap-4 px-4 py-2 text-xs font-medium text-kairo-ink-500">
        <div className="flex-1">Package</div>
        <div className="shrink-0 w-[320px] text-right">Channels & ownership</div>
      </div>

      {/* Package list */}
      {filteredPackages.length > 0 ? (
        <div className="space-y-3.5">
          {filteredPackages.map((pkg) => (
            <PackageRow
              key={pkg.id}
              pkg={pkg}
              brandId={brandId}
              opportunityTitle={mockApi.getOpportunityTitle(pkg.opportunity_id)}
              onEdit={() => mockApi.updatePackageStatus(brandId, pkg.id, "in_review")}
              onOpen={() => mockApi.updatePackageStatus(brandId, pkg.id, pkg.quality.band)}
            />
          ))}
        </div>
      ) : (
        <EmptyState filter={activeFilter} />
      )}
    </div>
  );
}

function EmptyState({ filter }: { filter: FilterStatus }) {
  const isFiltered = filter !== "all";
  const statusLabel = filter.replace("_", " ");

  return (
    <div
      className={[
        "flex flex-col items-center justify-center",
        "py-12 px-6",
        "max-w-md mx-auto",
        "rounded-(--kairo-radius-md)",
        "border border-dashed border-kairo-border-subtle",
        "bg-kairo-surface-soft",
      ].join(" ")}
    >
      <EmptyPackageIcon className="w-10 h-10 text-kairo-ink-300 mb-3" />

      <h3 className="text-sm font-medium text-kairo-ink-700 mb-1">
        {isFiltered ? `No ${statusLabel} packages` : "No packages yet"}
      </h3>

      <p className="text-xs text-kairo-ink-500 text-center mb-4 leading-relaxed">
        {isFiltered
          ? `Packages will appear here once they reach the "${statusLabel}" stage.`
          : "Create a package from today's opportunities, or start from scratch."}
      </p>

      {!isFiltered && (
        <KButton size="sm">
          New Package
        </KButton>
      )}
    </div>
  );
}

function EmptyPackageIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="6"
        y="10"
        width="28"
        height="24"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6 16H34"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M20 6V10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M13 6L14.5 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M27 6L25.5 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 24H28"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 28H22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

PackagesTable.displayName = "PackagesTable";
