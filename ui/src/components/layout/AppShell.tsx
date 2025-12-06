"use client";

import { ReactNode, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { BrandSidebar } from "./BrandSidebar";
import { TopBar } from "./TopBar";
import { getSectionFromPath, getSectionLabel } from "./navigation";
import { demoClient } from "@/lib/demoClient";
import { KairoChatChrome } from "@/components/chat";

interface AppShellProps {
  brandId: string;
  children: ReactNode;
}

export function AppShell({ brandId, children }: AppShellProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const pathname = usePathname();

  const brand = demoClient.getBrand(brandId);
  const sectionId = getSectionFromPath(pathname);
  const sectionLabel = getSectionLabel(sectionId);

  const handleAskKairo = useCallback(() => {
    setIsChatOpen(true);
  }, []);

  return (
    <div className="flex min-h-screen bg-kairo-sand-50">
      <BrandSidebar currentBrandId={brandId} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar brandId={brandId} onAskKairo={handleAskKairo} />
        <KairoChatChrome
          brandName={brand?.name ?? "Brand"}
          section={sectionLabel}
          isOpen={isChatOpen}
          onOpenChange={setIsChatOpen}
        >
          <main className="flex-1 overflow-auto">
            <div className="max-w-6xl mx-auto px-6 py-6">
              {children}
            </div>
          </main>
        </KairoChatChrome>
      </div>
    </div>
  );
}
