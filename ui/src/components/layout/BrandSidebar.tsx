"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { demoBrands, type DemoBrand } from "@/demo/brands";
import { navSections, getSectionFromPath } from "./navigation";

interface BrandSidebarProps {
  currentBrandId: string;
}

export function BrandSidebar({ currentBrandId }: BrandSidebarProps) {
  const pathname = usePathname();
  const currentSection = getSectionFromPath(pathname);

  return (
    <aside className="w-[240px] shrink-0 bg-kairo-bg-rail border-r border-kairo-border-soft flex flex-col">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-kairo-border-soft">
        <Link
          href="/"
          className="text-[19px] font-semibold text-kairo-primary-deep tracking-tight"
        >
          kairo
        </Link>
      </div>

      {/* Nav Content */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {/* Brands Section */}
        <div className="mb-6">
          <h3 className="text-[11px] font-medium text-kairo-text-subtle uppercase tracking-wider mb-2 px-2">
            Brands
          </h3>
          <ul className="space-y-0.5">
            {demoBrands.map((brand) => (
              <BrandNavItem
                key={brand.id}
                brand={brand}
                isActive={brand.id === currentBrandId}
                currentSection={currentSection}
              />
            ))}
          </ul>
        </div>

        {/* Section Nav */}
        <div>
          <h3 className="text-[11px] font-medium text-kairo-text-subtle uppercase tracking-wider mb-2 px-2">
            Navigation
          </h3>
          <ul className="space-y-0.5">
            {navSections.map((section) => (
              <li key={section.id}>
                <Link
                  href={`/brands/${currentBrandId}/${section.path}`}
                  className={[
                    "flex items-center px-3 py-2 rounded-lg text-[14px] transition-all duration-100",
                    currentSection === section.id
                      ? "bg-kairo-primary-soft text-kairo-primary-deep font-medium"
                      : "text-kairo-text-main hover:bg-kairo-primary-soft/50",
                  ].join(" ")}
                >
                  {section.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}

interface BrandNavItemProps {
  brand: DemoBrand;
  isActive: boolean;
  currentSection: string;
}

function BrandNavItem({ brand, isActive, currentSection }: BrandNavItemProps) {
  return (
    <li>
      <Link
        href={`/brands/${brand.id}/${currentSection}`}
        className={[
          "flex items-center px-3 py-2 rounded-lg text-[14px] transition-all duration-100",
          isActive
            ? "bg-kairo-primary-soft text-kairo-primary-deep font-medium"
            : "text-kairo-text-main hover:bg-kairo-primary-soft/50",
        ].join(" ")}
      >
        <span
          className={[
            "w-2 h-2 rounded-full mr-3 transition-colors",
            isActive ? "bg-kairo-primary" : "bg-kairo-text-subtle",
          ].join(" ")}
        />
        {brand.name}
      </Link>
    </li>
  );
}
