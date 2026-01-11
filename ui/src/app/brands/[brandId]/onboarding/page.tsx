// app/brands/[brandId]/onboarding/page.tsx
// Server shell for onboarding wizard

import { api } from "@/lib/api";
import { OnboardingWizardClient } from "@/components/onboarding";

interface OnboardingPageProps {
  params: Promise<{ brandId: string }>;
}

export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const { brandId } = await params;

  // Fetch initial data for SSR
  const [brand, onboarding, sources] = await Promise.all([
    api.getBrand(brandId),
    api.getOnboarding(brandId),
    api.listSources(brandId),
  ]);

  return (
    <OnboardingWizardClient
      brand={brand}
      initialOnboarding={onboarding}
      initialSources={sources}
    />
  );
}
