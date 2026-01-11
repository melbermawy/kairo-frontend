"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mockApi, NotFoundError } from "@/lib/mockApi";
import { getSectionFromPath, getSectionLabel } from "./navigation";
import { SparkleIcon } from "./NavIcons";

interface TopBarProps {
  brandId: string;
  onAskKairo?: () => void;
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
}

function getUserInitial(): string {
  // Placeholder - would come from auth context
  return "M";
}

export function TopBar({
  brandId,
  onAskKairo,
  onToggleMobileSidebar,
  isMobileSidebarOpen,
}: TopBarProps) {
  const pathname = usePathname();

  let brandName: string | null = null;
  try {
    const brand = mockApi.getBrand(brandId);
    brandName = brand.name;
  } catch (e) {
    if (!(e instanceof NotFoundError)) {
      throw e;
    }
  }

  const sectionId = getSectionFromPath(pathname);
  const sectionLabel = getSectionLabel(sectionId);

  return (
    <header className="fixed top-0 left-0 right-0 h-12 z-50 flex items-center bg-kairo-bg-elevated border-b border-kairo-border-subtle">
      <div className="w-full flex items-center justify-between">
        {/* Left: Hamburger (mobile) + Wordmark + Context */}
        <div className="flex items-center gap-2 pl-3 md:pl-6">
          {/* Mobile hamburger menu */}
          <button
            onClick={onToggleMobileSidebar}
            data-testid="mobile-sidebar-toggle"
            className="md:hidden p-1.5 rounded-lg text-kairo-fg-muted hover:text-kairo-fg hover:bg-kairo-bg-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-kairo-accent-500"
            aria-label={isMobileSidebarOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileSidebarOpen}
          >
            {isMobileSidebarOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Kairo wordmark */}
          <Link
            href="/"
            className="text-[18px] text-kairo-accent-400 hover:text-kairo-accent-300 transition-colors font-[family-name:var(--font-lugrasimo)]"
          >
            Kairo
          </Link>

          {/* Divider - hidden on small mobile */}
          <span className="hidden sm:block w-px h-4 bg-kairo-border-subtle" />

          {/* Brand + Section context - hidden on smallest screens */}
          <div className="hidden sm:flex items-center gap-1.5">
            {brandName && (
              <>
                <span className="text-[15px] font-medium text-kairo-fg">
                  {brandName}
                </span>
                <span className="text-[13px] text-kairo-fg-muted hidden md:inline">
                  – {sectionLabel}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-3 pr-3 md:pr-6">
          {/* Ask Kairo button - accent CTA */}
          <button
            onClick={onAskKairo}
            className={[
              "flex items-center gap-1.5 px-2.5 md:px-3 py-1.5",
              "bg-kairo-accent-600 hover:bg-kairo-accent-500",
              "text-white text-[12px] md:text-[13px] font-medium",
              "rounded-full",
              "kairo-transition-soft",
              "hover:scale-[1.02]",
              "shadow-soft hover:shadow-glow",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-kairo-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-kairo-bg-elevated",
            ].join(" ")}
          >
            <SparkleIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask Kairo</span>
          </button>

          {/* User avatar placeholder */}
          <div
            className={[
              "flex items-center justify-center w-7 h-7",
              "bg-kairo-bg-hover hover:bg-kairo-accent-500/20 text-kairo-fg-muted hover:text-kairo-accent-400 text-[11px] font-semibold",
              "rounded-full border border-kairo-border-subtle",
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

TopBar.displayName = "TopBar";
