"use client";

import { usePathname } from "next/navigation";
import { getBrandById } from "@/demo/brands";
import { getSectionFromPath, getSectionLabel } from "./navigation";

interface TopBarProps {
  brandId: string;
}

export function TopBar({ brandId }: TopBarProps) {
  const pathname = usePathname();
  const brand = getBrandById(brandId);
  const sectionId = getSectionFromPath(pathname);
  const sectionLabel = getSectionLabel(sectionId);

  const title = brand ? `${brand.name} – ${sectionLabel}` : sectionLabel;

  return (
    <header
      className="h-14 shrink-0 flex items-center px-6"
      style={{
        background: "linear-gradient(135deg, var(--kairo-primary) 0%, var(--kairo-primary-deep) 100%)",
      }}
    >
      <span className="text-kairo-text-inverse font-medium text-[15px] tracking-tight">
        {title}
      </span>
    </header>
  );
}
