export type OpportunityType = "trend" | "evergreen" | "competitive" | "campaign";

export interface DemoOpportunity {
  id: string;
  brandId: string;
  type: OpportunityType;
  score: number;
  title: string;
  angle: string;
  persona: string;
  pillar: string;
  source: string;
  sourceType: "article" | "competitor" | "social" | "internal";
  isPinned?: boolean;
  isSnoozed?: boolean;
}

export const demoOpportunities: DemoOpportunity[] = [
  // ============================================
  // ACME ANALYTICS OPPORTUNITIES
  // Story: Over-indexed on Attribution Reality + Data-driven CMO
  // Neglected: RevOps Efficiency pillar has untouched high-score ops
  // ============================================

  // Pinned high-performer - Attribution Reality (their strength)
  {
    id: "opp_001",
    brandId: "brand_001",
    type: "trend",
    score: 89,
    title: "CMOs are losing the attribution argument in board meetings",
    angle: "New Forrester data shows 67% of CMOs can't defend their attribution model under CFO scrutiny. Here's the fix.",
    persona: "Data-driven CMO",
    pillar: "Attribution Reality",
    source: "Forrester Q4 CMO survey",
    sourceType: "article",
    isPinned: true,
  },
  // High-score Attribution Reality - their comfort zone
  {
    id: "opp_002",
    brandId: "brand_001",
    type: "evergreen",
    score: 82,
    title: "The 3 attribution questions every board will ask in 2025",
    angle: "Prep your CMO for the questions they'll face—and the data they'll need to answer them.",
    persona: "Data-driven CMO",
    pillar: "Attribution Reality",
    source: "Internal analysis of customer conversations",
    sourceType: "internal",
  },
  // HIGH-SCORE BUT NEGLECTED - RevOps Efficiency (the gap)
  {
    id: "opp_003",
    brandId: "brand_001",
    type: "trend",
    score: 85,
    title: "RevOps teams are spending 12 hours/week on manual reporting",
    angle: "New benchmark data shows the automation gap is widening. Here's what top teams are doing differently.",
    persona: "RevOps Lead",
    pillar: "RevOps Efficiency",
    source: "RevOps Co-op benchmark report",
    sourceType: "article",
  },
  // Another neglected RevOps opportunity
  {
    id: "opp_004",
    brandId: "brand_001",
    type: "competitive",
    score: 78,
    title: "HubSpot just shipped a RevOps dashboard—here's what they got wrong",
    angle: "Their new feature solves the visibility problem but misses the action layer. There's an opening here.",
    persona: "RevOps Lead",
    pillar: "RevOps Efficiency",
    source: "HubSpot product launch",
    sourceType: "competitor",
  },
  // Lower priority - snoozed
  {
    id: "opp_005",
    brandId: "brand_001",
    type: "evergreen",
    score: 54,
    title: "Marketing-Sales alignment is still broken at most companies",
    angle: "The MQL handoff problem hasn't been solved—it's just been renamed.",
    persona: "RevOps Lead",
    pillar: "Marketing & Sales Alignment",
    source: "Internal performance data",
    sourceType: "internal",
    isSnoozed: true,
  },
  // Campaign type - lower score
  {
    id: "opp_006",
    brandId: "brand_001",
    type: "campaign",
    score: 48,
    title: "Q1 budget planning content for enterprise accounts",
    angle: "Annual planning season is starting—time to help teams justify marketing tech spend.",
    persona: "Data-driven CMO",
    pillar: "Data-Driven Culture",
    source: "Internal calendar trigger",
    sourceType: "internal",
  },

  // ============================================
  // SHORELINE STUDIO OPPORTUNITIES
  // Story: Heavy on Behind-the-Scenes, weak on Launch/promo content
  // Opportunities show the gap: high-score launch content sitting untouched
  // ============================================

  // Pinned - their strength (Behind the Scenes)
  {
    id: "opp_007",
    brandId: "brand_002",
    type: "trend",
    score: 88,
    title: "The 47-take video that changed everything",
    angle: "That viral moment wasn't luck—share the messy reality behind the final cut.",
    persona: "Aspiring Creator",
    pillar: "Behind the Scenes",
    source: "Trending creator discussion on X",
    sourceType: "social",
    isPinned: true,
  },
  // Another BTS strength
  {
    id: "opp_008",
    brandId: "brand_002",
    type: "evergreen",
    score: 79,
    title: "The gear I actually use vs. what I tell people to buy",
    angle: "Honest breakdown: expensive gear I returned, budget gear that outperformed, and the one thing worth the investment.",
    persona: "Aspiring Creator",
    pillar: "Creative Process",
    source: "FAQ from audience DMs",
    sourceType: "internal",
  },
  // HIGH-SCORE BUT NEGLECTED - Launch content (the gap)
  {
    id: "opp_009",
    brandId: "brand_002",
    type: "campaign",
    score: 84,
    title: "Client launch: Local bakery rebrand reveal",
    angle: "Show the transformation story—before/after that proves the value of professional creative work.",
    persona: "Small Business Owner",
    pillar: "Launch & Promos",
    source: "Recent client project completion",
    sourceType: "internal",
  },
  // Another neglected launch opportunity
  {
    id: "opp_010",
    brandId: "brand_002",
    type: "campaign",
    score: 76,
    title: "Creator course pre-launch: Build anticipation with behind-the-making",
    angle: "Turn the course creation process into content. Show the work before the sale.",
    persona: "Aspiring Creator",
    pillar: "Launch & Promos",
    source: "Internal launch calendar",
    sourceType: "internal",
  },
  // Lower score - snoozed
  {
    id: "opp_011",
    brandId: "brand_002",
    type: "competitive",
    score: 41,
    title: "Responding to competitor's viral reel format",
    angle: "Should we adopt the trending format or stay authentic to our style? Probably skip this one.",
    persona: "Aspiring Creator",
    pillar: "Creative Process",
    source: "Competitor content analysis",
    sourceType: "competitor",
    isSnoozed: true,
  },
];

export function getOpportunitiesByBrand(brandId: string): DemoOpportunity[] {
  return demoOpportunities.filter((o) => o.brandId === brandId);
}

export function getOpportunityById(id: string): DemoOpportunity | undefined {
  return demoOpportunities.find((o) => o.id === id);
}
