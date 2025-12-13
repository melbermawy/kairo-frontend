export type PackageStatus = "draft" | "in_review" | "scheduled" | "published";
export type PackageChannel = "linkedin" | "x" | "youtube_script";

export interface DemoVariant {
  id: string;
  channel: "LinkedIn" | "X";
  body: string;
  pattern: string;
  status: "draft" | "edited" | "approved";
}

export interface DemoPackage {
  id: string;
  brandId: string;
  opportunityId: string | null;
  title: string;
  thesis: string;
  supportingPoints: string[];
  persona: string;
  pillar: string;
  status: PackageStatus;
  channels: PackageChannel[];
  variants: DemoVariant[];
  owner: string;
  lastUpdated: string;
}

export const demoPackages: DemoPackage[] = [
  // ============================================
  // ACME ANALYTICS PACKAGES
  // Story: Lots of Attribution content in progress (their strength)
  // RevOps Efficiency has stale drafts (their neglected area)
  // Pipeline: 2 draft (1 stale), 2 in_review, 1 scheduled, 1 published
  // ============================================

  // In Review - Attribution Reality (active, recent)
  {
    id: "pkg_001",
    brandId: "brand_001",
    opportunityId: "opp_001",
    title: "Why CMOs lose the attribution argument (and how to win)",
    thesis: "Most CMOs can't defend their attribution model because they're showing activity, not outcomes. Connect every metric to revenue or lose the argument.",
    supportingPoints: [
      "67% of CMOs can't answer basic attribution questions under board scrutiny",
      "The fix: revenue-connected attribution that speaks CFO language",
      "Three dashboard changes that transform the conversation",
    ],
    persona: "Data-driven CMO",
    pillar: "Attribution Reality",
    status: "in_review",
    channels: ["linkedin", "x"],
    variants: [
      {
        id: "var_001",
        channel: "LinkedIn",
        body: "I've sat in dozens of board meetings where CMOs lost the attribution argument.\n\nNot because their marketing wasn't working.\nBecause their dashboards showed activity, not outcomes.\n\nHere's what the CMOs who win do differently:",
        pattern: "Confessional story → lesson",
        status: "edited",
      },
      {
        id: "var_002",
        channel: "X",
        body: "Hot take: Your attribution dashboard is why you're losing budget battles.\n\nIt shows clicks. Opens. MQLs.\n\nThe CFO sees: costs without outcomes.\n\nThe fix? Revenue-connected attribution. Here's how 🧵",
        pattern: "Hot take → thread",
        status: "approved",
      },
    ],
    owner: "Nadia",
    lastUpdated: "2024-12-04T14:30:00Z",
  },
  // In Review - Attribution Reality (active, recent)
  {
    id: "pkg_002",
    brandId: "brand_001",
    opportunityId: "opp_002",
    title: "The 3 attribution questions boards will ask in 2025",
    thesis: "Board scrutiny on marketing spend is intensifying. Here are the exact questions coming—and the data you need to answer them.",
    supportingPoints: [
      "Question 1: What's the actual cost to acquire a dollar of pipeline?",
      "Question 2: Which channels drive deals, not just leads?",
      "Question 3: What would happen if we cut spend by 20%?",
    ],
    persona: "Data-driven CMO",
    pillar: "Attribution Reality",
    status: "in_review",
    channels: ["linkedin"],
    variants: [
      {
        id: "var_003",
        channel: "LinkedIn",
        body: "Talked to 12 CMOs last month about their board meetings.\n\nEvery single one got asked a variation of these 3 questions:\n\n1. What's the actual cost per dollar of pipeline?\n2. Which channels drive deals, not leads?\n3. What if we cut 20%?\n\nHere's how to answer them:",
        pattern: "Confessional story → lesson",
        status: "edited",
      },
    ],
    owner: "Omar",
    lastUpdated: "2024-12-03T11:00:00Z",
  },
  // STALE DRAFT - RevOps Efficiency (neglected, >14 days old)
  {
    id: "pkg_003",
    brandId: "brand_001",
    opportunityId: "opp_003",
    title: "The 12-hour reporting problem RevOps teams can't shake",
    thesis: "Despite all the automation promises, RevOps teams are still spending half their week on manual reporting. Here's what actually works.",
    supportingPoints: [
      "New benchmark: RevOps spends 12+ hours/week on reports",
      "The automation tools that promise but don't deliver",
      "What top 10% teams do differently",
    ],
    persona: "RevOps Lead",
    pillar: "RevOps Efficiency",
    status: "draft",
    channels: ["linkedin", "x"],
    variants: [
      {
        id: "var_004",
        channel: "LinkedIn",
        body: "We surveyed 200 RevOps teams.\n\nAverage time spent on manual reporting: 12 hours/week.\n\nThat's 30% of their time. On reports.\n\nHere's what the top 10% do differently:",
        pattern: "Problem → solution → proof",
        status: "draft",
      },
    ],
    owner: "Nadia",
    lastUpdated: "2024-11-18T08:30:00Z", // >14 days = stale
  },
  // Fresh Draft - RevOps Efficiency (recent, not stale)
  {
    id: "pkg_004",
    brandId: "brand_001",
    opportunityId: "opp_004",
    title: "What HubSpot's new RevOps dashboard gets wrong",
    thesis: "HubSpot solved the visibility problem but missed the action layer. There's a gap worth talking about.",
    supportingPoints: [
      "The dashboard shows you what's happening—but not what to do",
      "Visibility without action is just better anxiety",
      "The missing piece: automated next steps",
    ],
    persona: "RevOps Lead",
    pillar: "RevOps Efficiency",
    status: "draft",
    channels: ["linkedin"],
    variants: [],
    owner: "Omar",
    lastUpdated: "2024-12-02T16:45:00Z",
  },
  // Scheduled - Data-Driven Culture (ready to go)
  {
    id: "pkg_005",
    brandId: "brand_001",
    opportunityId: null,
    title: "Pipeline velocity: the only marketing metric your CEO cares about",
    thesis: "Forget impressions, clicks, even MQLs. Pipeline velocity is the one number that tells the story of marketing's impact on revenue.",
    supportingPoints: [
      "What pipeline velocity is and why it matters",
      "The four levers that move it: volume, value, conversion, time",
      "How to present it in a way leadership remembers",
    ],
    persona: "Data-driven CMO",
    pillar: "Data-Driven Culture",
    status: "scheduled",
    channels: ["linkedin", "x"],
    variants: [
      {
        id: "var_005",
        channel: "LinkedIn",
        body: "Stop reporting on MQLs.\n\nSeriously. Your CEO doesn't care.\n\nThere's one metric that tells the full story of marketing's impact:\n\nPipeline velocity.\n\nHere's how to measure it, improve it, and present it:",
        pattern: "Contrarian hook → framework",
        status: "approved",
      },
    ],
    owner: "Nadia",
    lastUpdated: "2024-12-05T09:00:00Z",
  },
  // Published - Attribution Reality (completed)
  {
    id: "pkg_006",
    brandId: "brand_001",
    opportunityId: null,
    title: "We audited 50 marketing dashboards. Here's what we found.",
    thesis: "Most dashboards are data graveyards. The best ones tell a revenue story in under 10 seconds.",
    supportingPoints: [
      "The 3 charts that matter vs. the 15 that don't",
      "How to structure a dashboard that drives action",
      "Real before/after examples from our audit",
    ],
    persona: "RevOps Lead",
    pillar: "Attribution Reality",
    status: "published",
    channels: ["linkedin"],
    variants: [
      {
        id: "var_006",
        channel: "LinkedIn",
        body: "We audited 50 marketing dashboards last quarter.\n\nThe pattern was clear:\n\n• Average: 18 charts, 3 minutes to understand\n• Best-in-class: 5 charts, 10 seconds to understand\n\nHere's what separated them:",
        pattern: "Confessional story → lesson",
        status: "approved",
      },
    ],
    owner: "Omar",
    lastUpdated: "2024-11-25T14:00:00Z",
  },

  // ============================================
  // SHORELINE STUDIO PACKAGES
  // Story: Lots of Behind-the-Scenes content published
  // Launch content stuck in draft (their neglected area)
  // Pipeline: 1 draft (stale launch content), 1 in_review, 1 scheduled, 2 published
  // ============================================

  // Published - Behind the Scenes (their strength)
  {
    id: "pkg_007",
    brandId: "brand_002",
    opportunityId: "opp_007",
    title: "47 takes later: the real story behind the viral video",
    thesis: "Viral moments aren't accidents—they're the result of preparation meeting opportunity. Here's what actually happened.",
    supportingPoints: [
      "The concept pivot that made it work",
      "Why take 47 was different from take 1",
      "What we learned about authenticity vs. perfection",
    ],
    persona: "Aspiring Creator",
    pillar: "Behind the Scenes",
    status: "published",
    channels: ["x", "youtube_script"],
    variants: [
      {
        id: "var_007",
        channel: "X",
        body: "That video that got 2M views?\n\nHere's what you didn't see:\n\n- 47 takes\n- 3 location changes\n- 1 complete concept pivot\n- 6 hours of editing for 60 seconds\n\nThe 'overnight success' story is a myth. Here's what actually happened 🧵",
        pattern: "Behind the curtain → thread",
        status: "approved",
      },
    ],
    owner: "Layla",
    lastUpdated: "2024-11-28T13:20:00Z",
  },
  // Published - Creative Process (their strength)
  {
    id: "pkg_008",
    brandId: "brand_002",
    opportunityId: "opp_008",
    title: "Gear I actually use vs. gear I tell people to buy",
    thesis: "Stop buying gear based on specs. Here's what actually works in real production scenarios—and what I returned.",
    supportingPoints: [
      "The $800 mic I returned for a $200 one",
      "Budget alternatives that outperformed expectations",
      "The one piece of gear worth the investment",
    ],
    persona: "Aspiring Creator",
    pillar: "Creative Process",
    status: "published",
    channels: ["x"],
    variants: [
      {
        id: "var_008",
        channel: "X",
        body: "Gear I bought this year:\n\n✅ Kept: $200 mic (sounds better than my $800 one)\n❌ Returned: $3K camera (overkill for our content)\n🤔 Jury's out: New lighting kit\n\nFull breakdown of what's actually worth it:",
        pattern: "List → honest review",
        status: "approved",
      },
    ],
    owner: "Layla",
    lastUpdated: "2024-11-30T10:00:00Z",
  },
  // In Review - Creative Process (active)
  {
    id: "pkg_009",
    brandId: "brand_002",
    opportunityId: null,
    title: "My creative process is chaos (and that's okay)",
    thesis: "Everyone wants a clean, repeatable process. But the best creative work often comes from structured chaos.",
    supportingPoints: [
      "Why I stopped trying to systematize creativity",
      "The 3 constraints that actually help",
      "How to find your own version of productive chaos",
    ],
    persona: "Aspiring Creator",
    pillar: "Creative Process",
    status: "in_review",
    channels: ["youtube_script"],
    variants: [],
    owner: "Layla",
    lastUpdated: "2024-12-03T15:30:00Z",
  },
  // Scheduled - Behind the Scenes (ready to go)
  {
    id: "pkg_010",
    brandId: "brand_002",
    opportunityId: null,
    title: "Client said no to my first 3 ideas—here's what saved the project",
    thesis: "Rejection is part of client work. The skill is knowing when to push back and when to pivot.",
    supportingPoints: [
      "The 3 concepts that got rejected (and why)",
      "How I reframed the brief to unlock new ideas",
      "The final concept that exceeded expectations",
    ],
    persona: "Small Business Owner",
    pillar: "Behind the Scenes",
    status: "scheduled",
    channels: ["x", "youtube_script"],
    variants: [
      {
        id: "var_009",
        channel: "X",
        body: "My client rejected my first 3 concepts.\n\nI was frustrated. They were good ideas.\n\nBut here's what I learned:\n\n'Good ideas' that don't solve the real problem aren't actually good.\n\nHere's how I salvaged the project 🧵",
        pattern: "Behind the curtain → thread",
        status: "approved",
      },
    ],
    owner: "Layla",
    lastUpdated: "2024-12-04T11:00:00Z",
  },
  // STALE DRAFT - Launch content (neglected, >14 days old)
  {
    id: "pkg_011",
    brandId: "brand_002",
    opportunityId: "opp_009",
    title: "Local bakery rebrand: The before & after reveal",
    thesis: "Show the transformation—visual proof of what professional creative work can do for a small business.",
    supportingPoints: [
      "The original brand and why it wasn't working",
      "Our creative approach and the pushback we got",
      "The results: 40% increase in foot traffic",
    ],
    persona: "Small Business Owner",
    pillar: "Launch & Promos",
    status: "draft",
    channels: ["x", "youtube_script"],
    variants: [],
    owner: "Layla",
    lastUpdated: "2024-11-15T09:00:00Z", // >14 days = stale
  },
];

// Map opportunity IDs to titles for display
const opportunityTitleMap: Record<string, string> = {
  opp_001: "CMOs are losing the attribution argument in board meetings",
  opp_002: "The 3 attribution questions every board will ask in 2025",
  opp_003: "RevOps teams are spending 12 hours/week on manual reporting",
  opp_004: "HubSpot just shipped a RevOps dashboard—here's what they got wrong",
  opp_007: "The 47-take video that changed everything",
  opp_008: "The gear I actually use vs. what I tell people to buy",
  opp_009: "Client launch: Local bakery rebrand reveal",
};

export function getOpportunityTitleById(oppId: string | null): string | null {
  if (!oppId) return null;
  return opportunityTitleMap[oppId] ?? null;
}

export function getPackagesByBrand(brandId: string): DemoPackage[] {
  return demoPackages.filter((p) => p.brandId === brandId);
}

export function getPackageById(packageId: string): DemoPackage | undefined {
  return demoPackages.find((p) => p.id === packageId);
}
