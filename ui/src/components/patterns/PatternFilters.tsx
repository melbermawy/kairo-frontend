"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PatternRow } from "./PatternRow";
import type { Pattern, PatternCategory } from "@/lib/mockApi";

type FilterCategory = "all" | PatternCategory;

interface PatternFiltersProps {
  patterns: Pattern[];
}

const categoryTabs: { value: FilterCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "evergreen", label: "Evergreen" },
  { value: "launch", label: "Launch" },
  { value: "education", label: "Education" },
  { value: "engagement", label: "Engagement" },
];

export function PatternFilters({ patterns }: PatternFiltersProps) {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");

  const filteredPatterns =
    activeCategory === "all"
      ? patterns
      : patterns.filter((p) => p.category === activeCategory);

  // Count patterns per category
  const categoryCounts = patterns.reduce(
    (acc, pattern) => {
      acc[pattern.category] = (acc[pattern.category] || 0) + 1;
      return acc;
    },
    {} as Record<PatternCategory, number>
  );

  return (
    <div className="space-y-4">
      {/* Category filter tabs */}
      <div className="relative flex items-center gap-1 p-1 bg-kairo-sand-50 rounded-(--kairo-radius-md) w-fit">
        {categoryTabs.map((tab) => {
          const isActive = activeCategory === tab.value;
          const count =
            tab.value === "all"
              ? patterns.length
              : categoryCounts[tab.value as PatternCategory] || 0;

          return (
            <button
              key={tab.value}
              onClick={() => setActiveCategory(tab.value)}
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
                  layoutId="activeCategoryTab"
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

      {/* Pattern list */}
      {filteredPatterns.length > 0 ? (
        <div className="space-y-2">
          {filteredPatterns.map((pattern) => (
            <PatternRow key={pattern.id} pattern={pattern} />
          ))}
        </div>
      ) : (
        <EmptyState category={activeCategory} />
      )}
    </div>
  );
}

function EmptyState({ category }: { category: FilterCategory }) {
  const categoryLabel = category === "all" ? "" : category;

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
      <EmptyPatternsIcon className="w-10 h-10 text-kairo-ink-300 mb-3" />

      <h3 className="text-sm font-medium text-kairo-ink-700 mb-1">
        No {categoryLabel} patterns match this filter
      </h3>

      <p className="text-xs text-kairo-ink-500 text-center leading-relaxed">
        In a real app, this is where you'd create or import a pattern.
      </p>
    </div>
  );
}

function EmptyPatternsIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="4"
        y="8"
        width="32"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="4"
        y="17"
        width="32"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="4"
        y="26"
        width="32"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M10 11H22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10 20H18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10 29H24"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

PatternFilters.displayName = "PatternFilters";
