import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";

interface BrandLayoutProps {
  children: ReactNode;
  params: Promise<{ brandId: string }>;
}

export default async function BrandLayout({ children, params }: BrandLayoutProps) {
  const { brandId } = await params;

  // Fetch brands list and validate current brand exists
  const brands = await api.listBrands();
  const brandExists = brands.some((b) => b.id === brandId);

  if (!brandExists) {
    notFound();
  }

  return (
    <AppShell brandId={brandId} initialBrands={brands}>
      {children}
    </AppShell>
  );
}
