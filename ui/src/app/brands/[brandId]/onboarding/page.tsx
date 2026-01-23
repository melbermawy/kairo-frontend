// app/brands/[brandId]/onboarding/page.tsx
// Server shell for onboarding wizard

import { getOnboardingBootstrapServer } from "@/lib/api/server";
import { OnboardingWizardClient } from "@/components/onboarding";

interface OnboardingPageProps {
  params: Promise<{ brandId: string }>;
}

export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const { brandId } = await params;

  // Use server-side bootstrap for combined fetch
  const { brand, onboarding, sources } = await getOnboardingBootstrapServer(brandId);

  return (
    <OnboardingWizardClient
      brand={brand}
      initialOnboarding={onboarding}
      initialSources={sources}
    />
  );
}
