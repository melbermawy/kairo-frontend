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
    <div className="flex min-h-screen bg-kairo-bg-page">
      <BrandSidebar currentBrandId={brandId} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar brandId={brandId} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
