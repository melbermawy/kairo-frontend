export interface BrandVoice {
  summary: string;
  toneTags: string[];
  nevers: string[];
}

export interface DemoBrand {
  id: string;
  slug: string;
  name: string;
  vertical: string;
  description: string;
  tone: string[];
  channels: string[];
  positioning: string;
  pillars: string[];
  personas: string[];
  voice: BrandVoice;
}

export const demoBrands: DemoBrand[] = [
  {
    id: "brand_001",
    slug: "acme-analytics",
    name: "Acme Analytics",
    vertical: "B2B SaaS / Marketing Analytics",
    description: "Marketing analytics platform for data-driven teams",
    tone: ["Direct", "Analytical", "Supportive"],
    channels: ["LinkedIn", "X"],
    positioning: "The only marketing analytics platform that connects attribution to actual revenue outcomes.",
    pillars: ["Attribution", "Revenue Analytics", "Marketing ROI", "Data Integration"],
    personas: ["Data-driven CMO", "RevOps Lead", "Growth Marketer"],
    voice: {
      summary: "Direct, optimistic, and analytical. We speak to peers, not prospects. No hype, no fluff—just insights that help marketers prove their value.",
      toneTags: ["Analytical", "No vanity metrics", "CMO-friendly", "Data-first", "Peer-to-peer"],
      nevers: [
        "Don't dunk on competitors by name",
        "Avoid jargon without explanation",
        "Never promise instant ROI",
      ],
    },
  },
  {
    id: "brand_002",
    slug: "shoreline-studio",
    name: "Shoreline Studio",
    vertical: "B2C / Creator",
    description: "Independent video creator and creative studio",
    tone: ["Story-driven", "Playful", "Honest"],
    channels: ["X", "YouTube Shorts"],
    positioning: "Authentic creative storytelling that connects brands with real audiences.",
    pillars: ["Creative Process", "Behind the Scenes", "Industry Insights", "Client Stories"],
    personas: ["Aspiring Creator", "Small Business Owner", "Marketing Manager"],
    voice: {
      summary: "Story-driven, playful, and refreshingly honest. We share the real process—wins, failures, and everything in between.",
      toneTags: ["Behind-the-scenes", "Authentic", "Creator-first", "No gatekeeping", "Real talk"],
      nevers: [
        "Don't pretend everything is easy",
        "Never use stock footage vibes",
        "Avoid corporate speak",
      ],
    },
  },
];

export const DEFAULT_BRAND_ID = demoBrands[0].id;

export function getBrandById(id: string): DemoBrand | undefined {
  return demoBrands.find((b) => b.id === id);
}

export function getBrandBySlug(slug: string): DemoBrand | undefined {
  return demoBrands.find((b) => b.slug === slug);
}
