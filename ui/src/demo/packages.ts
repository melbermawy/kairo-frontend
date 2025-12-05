export type PackageStatus = "draft" | "in_review" | "approved" | "scheduled" | "published";

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
  channels: string[];
  variants: DemoVariant[];
}

export const demoPackages: DemoPackage[] = [
  // Acme Analytics packages
  {
    id: "pkg_001",
    brandId: "brand_001",
    opportunityId: "opp_001",
    title: "Attribution dashboards should tell a revenue story",
    thesis: "Most attribution dashboards show data without insight. CMOs need dashboards that connect marketing activity to revenue outcomes in plain language.",
    supportingPoints: [
      "Current dashboards overwhelm with metrics but underwhelm with meaning",
      "Revenue-connected attribution changes the conversation with the CFO",
      "The best teams are moving beyond last-touch to multi-touch revenue models",
    ],
    persona: "Data-driven CMO",
    pillar: "Attribution",
    status: "in_review",
    channels: ["LinkedIn", "X"],
    variants: [
      {
        id: "var_001",
        channel: "LinkedIn",
        body: "I've reviewed hundreds of marketing dashboards this year.\n\nMost of them have the same problem: they show what happened, but not why it matters.\n\nHere's what the best CMOs are doing differently with their attribution...",
        pattern: "Confessional story → lesson",
        status: "edited",
      },
      {
        id: "var_002",
        channel: "LinkedIn",
        body: "Your attribution dashboard is lying to you.\n\nNot intentionally. But by showing you conversion data without revenue context, it's giving you half the story.\n\nHere's what to add to get the full picture:",
        pattern: "Contrarian hook → framework",
        status: "draft",
      },
      {
        id: "var_003",
        channel: "X",
        body: "Hot take: Most attribution dashboards are useless.\n\nThey show conversions but not revenue.\n\nThe fix? Connect every touchpoint to actual closed deals.\n\nThread on how to do this 🧵",
        pattern: "Hot take → thread",
        status: "approved",
      },
    ],
  },
  {
    id: "pkg_002",
    brandId: "brand_001",
    opportunityId: "opp_002",
    title: "The case against last-touch attribution",
    thesis: "Last-touch attribution is the marketing equivalent of giving the closer all the credit in a team sale. RevOps teams are waking up to this.",
    supportingPoints: [
      "Last-touch ignores the 90% of work that created the opportunity",
      "Multi-touch models reveal which campaigns actually drive pipeline",
      "The CFO conversation changes when you can show full-funnel impact",
    ],
    persona: "RevOps Lead",
    pillar: "Revenue Analytics",
    status: "draft",
    channels: ["LinkedIn"],
    variants: [
      {
        id: "var_004",
        channel: "LinkedIn",
        body: "Last-touch attribution is like giving the closer all credit for a team sale.\n\nSure, they signed the deal. But what about the SDR who booked the meeting? The content that educated the buyer? The webinar that built trust?\n\nHere's why RevOps teams are moving on:",
        pattern: "Analogy → insight",
        status: "draft",
      },
    ],
  },
  {
    id: "pkg_003",
    brandId: "brand_001",
    opportunityId: null,
    title: "Data integration best practices for marketing teams",
    thesis: "Marketing data silos cost more than you think—in time, accuracy, and missed opportunities.",
    supportingPoints: [
      "The average marketing team uses 12+ tools that don't talk to each other",
      "Manual data reconciliation wastes 5+ hours per week",
      "Unified data enables real-time optimization instead of monthly reports",
    ],
    persona: "Growth Marketer",
    pillar: "Data Integration",
    status: "published",
    channels: ["LinkedIn", "X"],
    variants: [
      {
        id: "var_005",
        channel: "LinkedIn",
        body: "We audited our marketing stack last quarter.\n\n12 tools. 4 spreadsheets. 0 single sources of truth.\n\nHere's what we did to fix it (and what we learned along the way):",
        pattern: "Audit reveal → lessons",
        status: "approved",
      },
      {
        id: "var_006",
        channel: "X",
        body: "Your marketing team probably has a data silo problem.\n\nSigns you do:\n- Reports don't match\n- \"Let me check the spreadsheet\"\n- Monthly reports instead of real-time\n\nHow to fix it 👇",
        pattern: "Problem signs → solution",
        status: "approved",
      },
    ],
  },
  // Shoreline Studio packages
  {
    id: "pkg_004",
    brandId: "brand_002",
    opportunityId: "opp_004",
    title: "The story behind our viral moment",
    thesis: "Viral moments aren't accidents—they're the result of preparation meeting opportunity. Here's what really happened.",
    supportingPoints: [
      "We'd been building this style for months before it clicked",
      "The 'overnight success' had 6 months of failed attempts behind it",
      "What we learned about timing and authenticity",
    ],
    persona: "Aspiring Creator",
    pillar: "Behind the Scenes",
    status: "scheduled",
    channels: ["X", "YouTube Shorts"],
    variants: [
      {
        id: "var_007",
        channel: "X",
        body: "That video that got 2M views?\n\nHere's what you didn't see:\n\n- 47 takes\n- 3 location changes\n- 1 complete concept pivot\n- 6 hours of editing for 60 seconds\n\nThe 'overnight success' story is a myth. Here's what actually happened 🧵",
        pattern: "Behind the curtain → thread",
        status: "approved",
      },
    ],
  },
  {
    id: "pkg_005",
    brandId: "brand_002",
    opportunityId: "opp_005",
    title: "Honest gear review from actual shoots",
    thesis: "Stop buying gear based on specs. Here's what actually works in real production scenarios.",
    supportingPoints: [
      "The expensive gear we returned and why",
      "Budget alternatives that outperformed expectations",
      "The one piece of gear worth the investment",
    ],
    persona: "Aspiring Creator",
    pillar: "Creative Process",
    status: "draft",
    channels: ["X"],
    variants: [
      {
        id: "var_008",
        channel: "X",
        body: "Gear I bought this year:\n\n✅ Kept: $200 mic (sounds better than my $800 one)\n❌ Returned: $3K camera (overkill for our content)\n🤔 Jury's out: New lighting kit\n\nFull breakdown of what's actually worth it:",
        pattern: "List → honest review",
        status: "draft",
      },
    ],
  },
];

export function getPackagesByBrand(brandId: string): DemoPackage[] {
  return demoPackages.filter((p) => p.brandId === brandId);
}

export function getPackageById(packageId: string): DemoPackage | undefined {
  return demoPackages.find((p) => p.id === packageId);
}
