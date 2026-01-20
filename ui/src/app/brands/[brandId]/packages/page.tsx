import { ContentIcon } from "@/components/layout/NavIcons";

interface PackagesPageProps {
  params: Promise<{ brandId: string }>;
}

export default async function PackagesPage({ params }: PackagesPageProps) {
  await params; // Consume params to avoid Next.js warning

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-kairo-accent-500/10 flex items-center justify-center mb-6">
        <ContentIcon className="w-8 h-8 text-kairo-accent-400" />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-semibold text-kairo-fg mb-2">
        Content Pipeline
      </h1>

      {/* Coming Soon Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-kairo-accent-500/10 border border-kairo-accent-500/20 mb-4">
        <span className="w-2 h-2 rounded-full bg-kairo-accent-400 animate-pulse" />
        <span className="text-sm font-medium text-kairo-accent-400">
          Coming Soon
        </span>
      </div>

      {/* Description */}
      <p className="text-kairo-fg-muted text-center max-w-md leading-relaxed">
        Transform your opportunities into production-ready content packages.
        Draft, refine, and schedule posts across all your channels from one place.
      </p>

      {/* Decorative elements */}
      <div className="mt-8 flex gap-3">
        <div className="w-12 h-1 rounded-full bg-kairo-bg-elevated" />
        <div className="w-8 h-1 rounded-full bg-kairo-bg-elevated" />
        <div className="w-4 h-1 rounded-full bg-kairo-bg-elevated" />
      </div>
    </div>
  );
}
