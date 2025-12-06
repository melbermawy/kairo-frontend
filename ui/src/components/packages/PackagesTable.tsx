"use client";

import { useState } from "react";
import { PackageRow } from "./PackageRow";
import { KButton } from "@/components/ui";
import type { DemoPackage, PackageStatus } from "@/demo/packages";
import { getOpportunityTitleById } from "@/demo/packages";

type FilterStatus = "all" | PackageStatus;

interface PackagesTableProps {
  packages: DemoPackage[];
  brandId: string;
}

const filterTabs: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "in_review", label: "In Review" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
];

export function PackagesTable({ packages, brandId }: PackagesTableProps) {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");

  const filteredPackages =
    activeFilter === "all"
      ? packages
      : packages.filter((p) => p.status === activeFilter);

  // Count packages per status for the filter badges
  const statusCounts = packages.reduce(
    (acc, pkg) => {
      acc[pkg.status] = (acc[pkg.status] || 0) + 1;
      return acc;
    },
    {} as Record<PackageStatus, number>
  );

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex items-center gap-1 p-1 bg-kairo-sand-50 rounded-(--kairo-radius-md) w-fit">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.value;
          const count = tab.value === "all" ? packages.length : (statusCounts[tab.value as PackageStatus] || 0);

          return (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={[
                "inline-flex items-center gap-1.5",
                "px-3 py-1.5",
                "rounded-(--kairo-radius-sm)",
                "text-xs font-medium",
                "transition-all duration-100",
                isActive
                  ? "bg-kairo-surface-plain text-kairo-ink-900 shadow-soft"
                  : "text-kairo-ink-500 hover:text-kairo-ink-700",
              ].join(" ")}
            >
              {tab.label}
              <span
                className={[
                  "text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
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
        <div className="space-y-1.5">
          {filteredPackages.map((pkg) => (
            <PackageRow
              key={pkg.id}
              pkg={pkg}
              brandId={brandId}
              opportunityTitle={getOpportunityTitleById(pkg.opportunityId)}
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
