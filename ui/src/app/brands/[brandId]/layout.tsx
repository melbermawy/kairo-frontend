import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getBrandById } from "@/demo/brands";
import { AppShell } from "@/components/layout/AppShell";

interface BrandLayoutProps {
  children: ReactNode;
  params: Promise<{ brandId: string }>;
}

export default async function BrandLayout({ children, params }: BrandLayoutProps) {
  const { brandId } = await params;
  const brand = getBrandById(brandId);

  if (!brand) {
    notFound();
  }

  return <AppShell brandId={brandId}>{children}</AppShell>;
}
