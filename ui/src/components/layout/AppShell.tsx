"use client";

import { ReactNode } from "react";
import { BrandSidebar } from "./BrandSidebar";
import { TopBar } from "./TopBar";

interface AppShellProps {
  brandId: string;
  children: ReactNode;
}

export function AppShell({ brandId, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-kairo-sand-50">
      <BrandSidebar currentBrandId={brandId} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar brandId={brandId} />
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
