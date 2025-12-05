export type OpportunityType = "trend" | "evergreen" | "competitive" | "campaign";

export interface DemoOpportunity {
  id: string;
  brandId: string;
  type: OpportunityType;
  score: number;
  angle: string;
  persona: string;
  pillar: string;
  source: string;
  sourceType: "article" | "competitor" | "social" | "internal";
}

export const demoOpportunities: DemoOpportunity[] = [
  // Acme Analytics opportunities
  {
    id: "opp_001",
    brandId: "brand_001",
    type: "trend",
    score: 87,
    angle: "Attribution dashboards are failing CMOs—here's what they actually need to see",
    persona: "Data-driven CMO",
    pillar: "Attribution",
    source: "HBR article on marketing measurement gaps",
    sourceType: "article",
  },
  {
    id: "opp_002",
    brandId: "brand_001",
    type: "competitive",
    score: 72,
    angle: "Why RevOps teams are abandoning last-touch attribution",
    persona: "RevOps Lead",
    pillar: "Revenue Analytics",
    source: "Competitor blog post from Mixpanel",
    sourceType: "competitor",
  },
  {
    id: "opp_003",
    brandId: "brand_001",
    type: "evergreen",
    score: 65,
    angle: "The hidden cost of marketing data silos (and how to fix them)",
    persona: "Growth Marketer",
    pillar: "Data Integration",
    source: "Internal performance data",
    sourceType: "internal",
  },
  // Shoreline Studio opportunities
  {
    id: "opp_004",
    brandId: "brand_002",
    type: "trend",
    score: 91,
    angle: "Behind the viral moment: what actually happened in our latest shoot",
    persona: "Aspiring Creator",
    pillar: "Behind the Scenes",
    source: "Trending creator discussion on X",
    sourceType: "social",
  },
  {
    id: "opp_005",
    brandId: "brand_002",
    type: "evergreen",
    score: 78,
    angle: "The gear we actually use (and what we returned)",
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
    angle: "Small business spotlight: how we transformed their brand story",
    persona: "Small Business Owner",
    pillar: "Client Stories",
    source: "Recent client project completion",
    sourceType: "internal",
  },
];

export function getOpportunitiesByBrand(brandId: string): DemoOpportunity[] {
  return demoOpportunities.filter((o) => o.brandId === brandId);
}
