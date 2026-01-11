"use client";

import { ReactNode, useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BrandSidebar } from "./BrandSidebar";
import { TopBar } from "./TopBar";
import { getSectionFromPath, getSectionLabel } from "./navigation";
import { api } from "@/lib/api";
import type { BrandCore } from "@/contracts";
import { KairoChatChrome } from "@/components/chat";

interface AppShellProps {
  brandId: string;
  initialBrands: BrandCore[];
  children: ReactNode;
}

// Layout constants
const SIDEBAR_WIDTH = 240;
const HEADER_HEIGHT = 48;

export function AppShell({ brandId, initialBrands, children }: AppShellProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [brands, setBrands] = useState<BrandCore[]>(initialBrands);
  const pathname = usePathname();

  // Find current brand name from the brands list
  const currentBrand = brands.find((b) => b.id === brandId);
  const brandName = currentBrand?.name ?? "Brand";

  // Handle brand creation - add to local list
  const handleBrandCreated = useCallback((newBrand: BrandCore) => {
    setBrands((prev) => [...prev, newBrand]);
  }, []);

  const sectionId = getSectionFromPath(pathname);
  const sectionLabel = getSectionLabel(sectionId);

  const handleAskKairo = useCallback(() => {
    setIsChatOpen(true);
  }, []);

  const handleToggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen((prev) => !prev);
  }, []);

  const handleCloseMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  // Handle escape key for mobile sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileSidebarOpen) {
        handleCloseMobileSidebar();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobileSidebarOpen, handleCloseMobileSidebar]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileSidebarOpen]);

  return (
    <div className="min-h-screen bg-kairo-bg-app">
      {/* Header - fixed, full width */}
      <TopBar
        brandId={brandId}
        onAskKairo={handleAskKairo}
        onToggleMobileSidebar={handleToggleMobileSidebar}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      {/* Desktop sidebar - hidden on mobile, fixed position */}
      <aside
        className="hidden md:flex fixed left-0 top-0 bottom-0 z-40 flex-col"
        style={{ width: SIDEBAR_WIDTH, paddingTop: HEADER_HEIGHT }}
      >
        <div className="flex-1 overflow-y-auto bg-kairo-bg-panel border-r border-kairo-border-subtle">
          <BrandSidebar
            currentBrandId={brandId}
            brands={brands}
            onBrandCreated={handleBrandCreated}
          />
        </div>
      </aside>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseMobileSidebar}
              aria-hidden="true"
            />
            {/* Sidebar drawer */}
            <motion.aside
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden w-[280px] bg-kairo-bg-panel border-r border-kairo-border-subtle overflow-y-auto"
              style={{ paddingTop: HEADER_HEIGHT }}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <BrandSidebar
                currentBrandId={brandId}
                brands={brands}
                onNavigate={handleCloseMobileSidebar}
                onBrandCreated={handleBrandCreated}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div
        className="min-h-screen flex flex-col"
        style={{ paddingTop: HEADER_HEIGHT }}
      >
        <div className="flex-1 md:ml-[240px]">
          <KairoChatChrome
            brandName={brandName}
            section={sectionLabel}
            isOpen={isChatOpen}
            onOpenChange={setIsChatOpen}
          >
            <main className="flex-1">
              {/* MainContainer with max-width discipline */}
              <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                {children}
              </div>
            </main>
          </KairoChatChrome>
        </div>
      </div>
    </div>
  );
}

AppShell.displayName = "AppShell";
