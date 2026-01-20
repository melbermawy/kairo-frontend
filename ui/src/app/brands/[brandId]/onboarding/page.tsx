// app/brands/[brandId]/onboarding/page.tsx
// Server shell for onboarding wizard

import { api } from "@/lib/api";
import { OnboardingWizardClient } from "@/components/onboarding";

interface OnboardingPageProps {
  params: Promise<{ brandId: string }>;
}

export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const { brandId } = await params;

  // Use bootstrap for combined fetch (will use single endpoint when backend supports it)
  const { brand, onboarding, sources } = await api.getOnboardingBootstrap(brandId);

  return (
    <OnboardingWizardClient
      brand={brand}
      initialOnboarding={onboarding}
      initialSources={sources}
    />
  );
}
