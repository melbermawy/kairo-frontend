export interface BrandVoice {
  summary: string;
  toneTags: string[];
  nevers: string[];
  primaryChannel: string;
  primaryPersona: string;
}

export interface BrandPersona {
  id: string;
  name: string;
  role: string;
  summary: string;
  goals: string[];
  pains: string[];
  success: string[];
}

export interface BrandPillar {
  id: string;
  name: string;
  summary: string;
  exampleAngles: string[];
}

export interface BrandGuardrails {
  neverDo: string[];
  leanInto: string[];
}

export interface BrandStrategy {
  voice: BrandVoice;
  personas: BrandPersona[];
  pillars: BrandPillar[];
  guardrails: BrandGuardrails;
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
  strategy: BrandStrategy;
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
      primaryChannel: "LinkedIn",
      primaryPersona: "RevOps Lead",
    },
    strategy: {
      voice: {
        summary: "Direct, optimistic, and analytical. We speak to peers, not prospects. No hype, no fluff—just insights that help marketers prove their value.",
        toneTags: ["Plainspoken", "Evidence-led", "No buzzwords", "Peer-to-peer", "Optimistic"],
        nevers: [
          "Don't dunk on competitors by name",
          "Avoid jargon without explanation",
          "Never promise instant ROI",
        ],
        primaryChannel: "LinkedIn",
        primaryPersona: "RevOps Lead",
      },
      personas: [
        {
          id: "persona_001",
          name: "Jordan",
          role: "RevOps Lead",
          summary: "Owns the revenue tech stack and reports to both Sales and Marketing leadership on pipeline efficiency.",
          goals: [
            "Prove marketing's contribution to closed-won deals",
            "Reduce time spent reconciling data across tools",
            "Build dashboards leadership actually uses",
          ],
          pains: [
            "Spends 10+ hours/week stitching together reports",
            "Gets blamed when pipeline attribution doesn't match Sales' numbers",
            "Can't get budget for new tools without proving ROI first",
          ],
          success: [
            "Leadership trusts the attribution model without questioning it",
            "Marketing and Sales aligned on what counts as an MQL",
            "Able to run experiments without manual data wrangling",
          ],
        },
        {
          id: "persona_002",
          name: "Priya",
          role: "Data-Driven CMO",
          summary: "Reports to the CEO and needs to defend marketing spend with hard numbers, not vanity metrics.",
          goals: [
            "Tie every dollar of spend to revenue outcomes",
            "Justify headcount and budget increases to the board",
            "Build a repeatable, scalable demand gen engine",
          ],
          pains: [
            "Board asks questions the current data can't answer",
            "Attribution debates derail leadership meetings",
            "Can't confidently say which channels are actually working",
          ],
          success: [
            "Board meetings where marketing ROI isn't questioned",
            "A single source of truth for pipeline contribution",
            "Clear playbook for doubling down on what works",
          ],
        },
      ],
      pillars: [
        {
          id: "pillar_001",
          name: "Attribution Reality",
          summary: "Cut through attribution theater. Show what actually drives revenue, not what looks good in a slide deck.",
          exampleAngles: [
            "Why your attribution model is lying to you (and how to fix it)",
            "The hidden cost of last-touch attribution",
            "Multi-touch vs. incrementality: when to use each",
          ],
        },
        {
          id: "pillar_002",
          name: "RevOps Efficiency",
          summary: "Help revenue teams do more with less. Automation, integration, and workflows that actually save time.",
          exampleAngles: [
            "The RevOps stack audit: what to keep, what to kill",
            "Automating the report no one wants to build",
            "From 10 hours to 10 minutes: real workflow wins",
          ],
        },
        {
          id: "pillar_003",
          name: "Marketing & Sales Alignment",
          summary: "Bridge the gap between marketing and sales with shared metrics, shared language, and shared goals.",
          exampleAngles: [
            "The MQL is dead. Here's what replaces it.",
            "How to run a pipeline review both teams trust",
            "Building a lead scoring model Sales will actually use",
          ],
        },
        {
          id: "pillar_004",
          name: "Data-Driven Culture",
          summary: "Move from gut decisions to evidence-based strategy. Build the habits and systems that make data actionable.",
          exampleAngles: [
            "The dashboard no one looks at (and how to fix it)",
            "Running experiments when leadership wants certainty",
            "From data hoarder to data-driven: a 90-day plan",
          ],
        },
      ],
      guardrails: {
        neverDo: [
          "Name or disparage competitors directly",
          "Promise specific ROI numbers or timelines",
          "Use marketing jargon without explaining it",
          "Talk down to the audience—they're practitioners, not beginners",
          "Lead with product features instead of outcomes",
          "Use stock photography or generic B2B imagery",
        ],
        leanInto: [
          "Real numbers and case studies (anonymized if needed)",
          "Admitting what's hard about this problem",
          "Frameworks and mental models, not just tactics",
          "The voice of a trusted peer, not a vendor pitch",
          "Contrarian takes backed by evidence",
          "Behind-the-scenes of how we think about problems",
        ],
      },
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
      primaryChannel: "YouTube Shorts",
      primaryPersona: "Aspiring Creator",
    },
    strategy: {
      voice: {
        summary: "Story-driven, playful, and refreshingly honest. We share the real process—wins, failures, and everything in between.",
        toneTags: ["Behind-the-scenes", "Authentic", "Creator-first", "No gatekeeping", "Real talk"],
        nevers: [
          "Don't pretend everything is easy",
          "Never use stock footage vibes",
          "Avoid corporate speak",
        ],
        primaryChannel: "YouTube Shorts",
        primaryPersona: "Aspiring Creator",
      },
      personas: [
        {
          id: "persona_003",
          name: "Alex",
          role: "Aspiring Creator",
          summary: "Building a personal brand while working a day job, looking to go full-time within 2 years.",
          goals: [
            "Grow an engaged audience on multiple platforms",
            "Learn professional production techniques",
            "Build a portfolio that attracts brand deals",
          ],
          pains: [
            "Overwhelmed by conflicting advice from creator gurus",
            "Limited time and budget for equipment",
            "Imposter syndrome about competing with established creators",
          ],
          success: [
            "First paid brand collaboration",
            "Consistent content schedule that doesn't burn out",
            "Community that engages, not just follows",
          ],
        },
      ],
      pillars: [
        {
          id: "pillar_005",
          name: "Creative Process",
          summary: "Show the messy middle of making things. The failures, iterations, and happy accidents.",
          exampleAngles: [
            "This video took 47 takes. Here's why.",
            "My creative process is chaos (and that's okay)",
            "The edit that saved this video",
          ],
        },
        {
          id: "pillar_006",
          name: "Behind the Scenes",
          summary: "Pull back the curtain on client work, gear decisions, and the business of creativity.",
          exampleAngles: [
            "What I actually charge for brand work",
            "The gear I use vs. the gear I recommend",
            "Client said no to my first three ideas",
          ],
        },
      ],
      guardrails: {
        neverDo: [
          "Pretend success came easily or overnight",
          "Use clickbait that doesn't deliver",
          "Gate-keep information behind paid courses",
          "Punch down at smaller creators",
        ],
        leanInto: [
          "Sharing real numbers (views, revenue, failures)",
          "Admitting when something didn't work",
          "Celebrating other creators' wins",
          "Making complex techniques feel approachable",
        ],
      },
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

export function getBrandStrategy(brandId: string): BrandStrategy | undefined {
  const brand = getBrandById(brandId);
  return brand?.strategy;
}
