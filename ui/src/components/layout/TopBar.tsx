"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { mockApi, NotFoundError } from "@/lib/mockApi";
import { getSectionFromPath, getSectionLabel } from "./navigation";
import { SparkleIcon } from "./NavIcons";
import { useAuth } from "@/contexts/AuthContext";

interface TopBarProps {
  brandId: string;
  onAskKairo?: () => void;
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
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

          {/* User menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

function UserMenu() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    router.push("/login");
  };

  // Get user initial from email
  const getUserInitial = () => {
    if (!user?.email) return "?";
    return user.email[0].toUpperCase();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="w-7 h-7 rounded-full bg-kairo-bg-hover animate-pulse" />
    );
  }

  // Show login link if not authenticated
  if (!user) {
    return (
      <Link
        href="/login"
        className="text-[13px] text-kairo-accent-400 hover:text-kairo-accent-300 font-medium transition-colors"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={[
          "flex items-center justify-center w-7 h-7",
          "bg-kairo-bg-hover hover:bg-kairo-accent-500/20 text-kairo-fg-muted hover:text-kairo-accent-400 text-[11px] font-semibold",
          "rounded-full border border-kairo-border-subtle",
          "kairo-transition-soft",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-kairo-accent-500",
        ].join(" ")}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {getUserInitial()}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-(--kairo-radius-md) bg-kairo-bg-card border border-kairo-border-subtle shadow-elevated z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-kairo-border-subtle">
            <p className="text-sm font-medium text-kairo-fg truncate">
              {user.email}
            </p>
            <p className="text-xs text-kairo-fg-muted mt-0.5">
              Signed in
            </p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-kairo-fg-muted hover:text-kairo-fg hover:bg-kairo-bg-hover transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-kairo-fg-muted hover:text-kairo-fg hover:bg-kairo-bg-hover transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

TopBar.displayName = "TopBar";
