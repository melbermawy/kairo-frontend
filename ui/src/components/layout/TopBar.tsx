"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { demoClient } from "@/lib/demoClient";
import { getSectionFromPath, getSectionLabel } from "./navigation";
import { SparkleIcon } from "./NavIcons";

interface TopBarProps {
  brandId: string;
  onAskKairo?: () => void;
}

function getUserInitial(): string {
  // Placeholder - would come from auth context
  return "M";
}

export function TopBar({ brandId, onAskKairo }: TopBarProps) {
  const pathname = usePathname();
  const brand = demoClient.getBrand(brandId);
  const sectionId = getSectionFromPath(pathname);
  const sectionLabel = getSectionLabel(sectionId);

  return (
    <header className="h-12 shrink-0 flex items-center bg-kairo-aqua-500">
      <div className="flex-1 flex items-center justify-between px-6 max-w-[1400px]">
        {/* Left: Wordmark + Context */}
        <div className="flex items-center gap-3">
          {/* Kairo wordmark */}
          <Link
            href="/"
            className="text-[15px] font-semibold text-white tracking-tight hover:opacity-90 transition-opacity"
          >
            kairo
          </Link>

          {/* Divider */}
          <span className="w-px h-4 bg-white/30" />

          {/* Brand + Section context */}
          <div className="flex items-center gap-1.5">
            {brand && (
              <>
                <span className="text-[15px] font-medium text-white">
                  {brand.name}
                </span>
                <span className="text-[13px] text-white/70">
                  – {sectionLabel}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Ask Kairo button */}
          <button
            onClick={onAskKairo}
            className={[
              "flex items-center gap-1.5 px-3 py-1.5",
              "bg-white/15 hover:bg-white/25",
              "text-white text-[13px] font-medium",
              "rounded-(--kairo-radius-pill)",
              "kairo-transition-soft",
              "hover:scale-[1.02] hover:shadow-elevated",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-kairo-aqua-500",
            ].join(" ")}
          >
            <SparkleIcon className="w-3.5 h-3.5" />
            <span>Ask Kairo</span>
          </button>

          {/* User avatar placeholder */}
          <div
            className={[
              "flex items-center justify-center w-7 h-7",
              "bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold",
              "rounded-full",
              "kairo-transition-soft cursor-pointer",
            ].join(" ")}
          >
            {getUserInitial()}
          </div>
        </div>
      </div>
    </header>
  );
}
