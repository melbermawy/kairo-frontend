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
  // Acme Analytics opportunities
  {
    id: "opp_001",
    brandId: "brand_001",
    type: "trend",
    score: 87,
    title: "Attribution dashboards are failing CMOs",
    angle: "Here's what marketing leaders actually need to see in their dashboards to make faster decisions",
    persona: "Data-driven CMO",
    pillar: "Attribution",
    source: "HBR article on marketing measurement gaps",
    sourceType: "article",
    isPinned: true,
  },
  {
    id: "opp_002",
    brandId: "brand_001",
    type: "competitive",
    score: 72,
    title: "RevOps teams abandoning last-touch attribution",
    angle: "Why the shift to multi-touch is accelerating and what it means for your analytics stack",
    persona: "RevOps Lead",
    pillar: "Revenue Analytics",
    source: "Competitor blog post from Mixpanel",
    sourceType: "competitor",
  },
  {
    id: "opp_003",
    brandId: "brand_001",
    type: "evergreen",
    score: 52,
    title: "The hidden cost of marketing data silos",
    angle: "How disconnected data sources are silently draining your marketing ROI",
    persona: "Growth Marketer",
    pillar: "Data Integration",
    source: "Internal performance data",
    sourceType: "internal",
    isSnoozed: true,
  },
  {
    id: "opp_007",
    brandId: "brand_001",
    type: "campaign",
    score: 45,
    title: "Q1 planning content for enterprise accounts",
    angle: "Annual planning season is coming—time to position for enterprise budget conversations",
    persona: "Data-driven CMO",
    pillar: "Marketing ROI",
    source: "Internal calendar trigger",
    sourceType: "internal",
  },
  // Shoreline Studio opportunities
  {
    id: "opp_004",
    brandId: "brand_002",
    type: "trend",
    score: 91,
    title: "Behind the viral moment",
    angle: "What actually happened in our latest shoot that made it take off",
    persona: "Aspiring Creator",
    pillar: "Behind the Scenes",
    source: "Trending creator discussion on X",
    sourceType: "social",
    isPinned: true,
  },
  {
    id: "opp_005",
    brandId: "brand_002",
    type: "evergreen",
    score: 78,
    title: "The gear we actually use",
    angle: "Honest reviews of what's in our kit—and what we returned",
    persona: "Aspiring Creator",
    pillar: "Creative Process",
    source: "FAQ from audience DMs",
    sourceType: "internal",
  },
  {
    id: "opp_006",
    brandId: "brand_002",
    type: "campaign",
    score: 82,
    title: "Small business spotlight: brand transformation",
    angle: "How we transformed a local bakery's brand story in one week",
    persona: "Small Business Owner",
    pillar: "Client Stories",
    source: "Recent client project completion",
    sourceType: "internal",
  },
  {
    id: "opp_008",
    brandId: "brand_002",
    type: "competitive",
    score: 38,
    title: "Responding to competitor's viral reel format",
    angle: "Should we adopt the trending reel format or stay authentic to our style?",
    persona: "Marketing Manager",
    pillar: "Industry Insights",
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
