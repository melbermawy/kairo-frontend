export type PatternStatus = "active" | "experimental" | "deprecated";
export type PatternCategory = "evergreen" | "launch" | "education" | "engagement";

export interface DemoPattern {
  id: string;
  name: string;
  description: string;
  structure: string;
  beats: string[];
  exampleHook: string;
  usageCount: number;
  avgEngagement: number;
  channels: string[];
  performanceHint: string;
  status: PatternStatus;
  category: PatternCategory;
  lastUsedDaysAgo: number;
}

export const demoPatterns: DemoPattern[] = [
  // ============================================
  // TOP PERFORMERS - Used heavily in current packages
  // "Confessional story → lesson" is Acme's most-used pattern
  // ============================================
  {
    id: "pat_001",
    name: "Confessional story → lesson",
    description: "Open with a vulnerable admission or behind-the-scenes moment, then pivot to actionable insight.",
    structure: "Hook (confession) → Context → Turning point → Lesson → CTA",
    beats: ["Hook", "Context", "Twist", "Lesson"],
    exampleHook: "I've sat in dozens of board meetings where CMOs lost the attribution argument...",
    usageCount: 28,
    avgEngagement: 4.2,
    channels: ["LinkedIn"],
    performanceHint: "↑ 31% click-through on LinkedIn · Best for CMO persona",
    status: "active",
    category: "evergreen",
    lastUsedDaysAgo: 1, // Just used in pkg_001, pkg_002
  },
  {
    id: "pat_002",
    name: "Hot take → thread",
    description: "Lead with a bold, potentially controversial opinion, then unpack it with nuance in a thread.",
    structure: "Hot take → Nuance → Evidence → Counter-arguments → Conclusion",
    beats: ["Take", "Nuance", "Evidence", "Close"],
    exampleHook: "Hot take: Your attribution dashboard is why you're losing budget battles.",
    usageCount: 24,
    avgEngagement: 5.1,
    channels: ["X"],
    performanceHint: "↑ 2.4x retweets vs. average · Best for X",
    status: "active",
    category: "engagement",
    lastUsedDaysAgo: 1, // Used in pkg_001 X variant
  },
  {
    id: "pat_003",
    name: "Contrarian hook → framework",
    description: "Challenge conventional wisdom, then provide a structured alternative approach.",
    structure: "Contrarian statement → Why it's wrong → Your framework → Examples → Takeaway",
    beats: ["Hot take", "Why", "Framework", "CTA"],
    exampleHook: "Stop reporting on MQLs. Seriously. Your CEO doesn't care.",
    usageCount: 19,
    avgEngagement: 3.8,
    channels: ["LinkedIn", "X"],
    performanceHint: "↑ High engagement with CMO persona · Drives comments",
    status: "active",
    category: "engagement",
    lastUsedDaysAgo: 2, // Used in pkg_005
  },

  // ============================================
  // CREATOR PATTERNS - Shoreline's strengths
  // "Behind the curtain → thread" is their signature
  // ============================================
  {
    id: "pat_004",
    name: "Behind the curtain → thread",
    description: "Pull back the curtain on process, failures, or decisions. Authenticity-first storytelling.",
    structure: "Tease the reveal → The reality → What you learned → What you'd do differently",
    beats: ["Tease", "Reality", "Lesson", "Next"],
    exampleHook: "That video that got 2M views? Here's what you didn't see...",
    usageCount: 16,
    avgEngagement: 4.8,
    channels: ["X", "YouTube Shorts"],
    performanceHint: "↑ High saves and bookmarks · 2.1x shares vs. average",
    status: "active",
    category: "evergreen",
    lastUsedDaysAgo: 2, // Used in pkg_007, pkg_010
  },
  {
    id: "pat_005",
    name: "List → honest review",
    description: "Structured list format with genuine opinions, including negatives. No fluff.",
    structure: "Context → List items with verdicts → Summary recommendation",
    beats: ["Context", "List", "Verdict"],
    exampleHook: "Gear I bought this year: ✅ Kept / ❌ Returned / 🤔 Jury's out",
    usageCount: 18,
    avgEngagement: 3.9,
    channels: ["X", "LinkedIn"],
    performanceHint: "↑ Saves on X · High bookmark rate",
    status: "active",
    category: "education",
    lastUsedDaysAgo: 5, // Used in pkg_008
  },

  // ============================================
  // UNDERUSED BUT VALUABLE - Opportunities to explore
  // "Problem → solution → proof" great for RevOps content
  // ============================================
  {
    id: "pat_006",
    name: "Problem → solution → proof",
    description: "Classic problem-agitate-solve structure with data or testimonial proof.",
    structure: "Pain point → Agitate → Solution → Evidence → CTA",
    beats: ["Problem", "Agitate", "Solution", "Proof"],
    exampleHook: "RevOps teams spend 12 hours/week on manual reporting. Here's what the top 10% do differently.",
    usageCount: 6,
    avgEngagement: 3.6,
    channels: ["LinkedIn"],
    performanceHint: "↑ Strong for RevOps persona · Underused opportunity",
    status: "active",
    category: "education",
    lastUsedDaysAgo: 14, // Last used in pkg_003 (stale draft)
  },
  {
    id: "pat_007",
    name: "Analogy → insight",
    description: "Use a familiar concept to explain a complex idea, making it instantly relatable.",
    structure: "Analogy intro → Connection to topic → Deeper insight → Application",
    beats: ["Analogy", "Connect", "Insight"],
    exampleHook: "Last-touch attribution is like giving the closer all credit for a team sale.",
    usageCount: 8,
    avgEngagement: 3.4,
    channels: ["LinkedIn", "X"],
    performanceHint: "Works well for technical topics · Low competition",
    status: "active",
    category: "education",
    lastUsedDaysAgo: 12,
  },

  // ============================================
  // LAUNCH PATTERNS - Shoreline's gap
  // These are underused and could help with promo content
  // ============================================
  {
    id: "pat_008",
    name: "Transformation reveal",
    description: "Before/after showcase that proves value through visual or measurable change.",
    structure: "The before → The challenge → The process → The after → Results",
    beats: ["Before", "Challenge", "Process", "After"],
    exampleHook: "This local bakery's brand was invisible. Here's what changed...",
    usageCount: 3,
    avgEngagement: 4.1,
    channels: ["X", "YouTube Shorts"],
    performanceHint: "↑ High for client work showcases · Underused",
    status: "active",
    category: "launch",
    lastUsedDaysAgo: 28, // Not used recently - Shoreline's gap
  },
  {
    id: "pat_009",
    name: "Announcement → context → CTA",
    description: "Direct announcement format for launches and news, with context and clear next step.",
    structure: "Big news → Why it matters → What's next → CTA",
    beats: ["News", "Context", "Impact", "CTA"],
    exampleHook: "We just launched [thing]. Here's why it matters...",
    usageCount: 4,
    avgEngagement: 2.9,
    channels: ["LinkedIn", "X"],
    performanceHint: "Best for major announcements · Keep it rare",
    status: "active",
    category: "launch",
    lastUsedDaysAgo: 35,
  },

  // ============================================
  // EXPERIMENTAL / DEPRECATED
  // ============================================
  {
    id: "pat_010",
    name: "Myth vs reality",
    description: "Challenge common misconceptions with evidence-backed truth.",
    structure: "Common belief → Why it's wrong → The reality → Takeaway",
    beats: ["Myth", "Problem", "Reality", "Lesson"],
    exampleHook: "Everyone says MQLs matter. Here's why that's wrong...",
    usageCount: 2,
    avgEngagement: 4.0,
    channels: ["LinkedIn"],
    performanceHint: "Testing phase - early positive signals",
    status: "experimental",
    category: "education",
    lastUsedDaysAgo: 21,
  },
  {
    id: "pat_011",
    name: "Clickbait hook → substance",
    description: "Attention-grabbing opener that actually delivers on the promise.",
    structure: "Clickbait hook → Immediate payoff → Depth → Takeaway",
    beats: ["Hook", "Payoff", "Depth", "Close"],
    exampleHook: "This one change doubled our pipeline velocity...",
    usageCount: 1,
    avgEngagement: 2.1,
    channels: ["X"],
    performanceHint: "Deprecated - feels off-brand for Acme's voice",
    status: "deprecated",
    category: "engagement",
    lastUsedDaysAgo: 60,
  },
];

export function getAllPatterns(): DemoPattern[] {
  return demoPatterns;
}

export function getPatternById(id: string): DemoPattern | undefined {
  return demoPatterns.find((p) => p.id === id);
}

export function getPatternsByChannel(channel: string): DemoPattern[] {
  return demoPatterns.filter((p) => p.channels.includes(channel));
}

export function getPatternsByCategory(category: PatternCategory): DemoPattern[] {
  return demoPatterns.filter((p) => p.category === category);
}

/**
 * Get top recommended patterns for a brand, ranked by:
 * 1. Only active patterns
 * 2. usageCount descending (proven performers)
 * 3. lastUsedDaysAgo ascending (recency wins ties)
 *
 * For Acme: "Confessional story → lesson" should be #1
 */
export function getTopPatterns(limit = 3): DemoPattern[] {
  return demoPatterns
    .filter((p) => p.status === "active")
    .sort((a, b) => {
      // Primary: usageCount descending
      if (b.usageCount !== a.usageCount) {
        return b.usageCount - a.usageCount;
      }
      // Tie-break: lastUsedDaysAgo ascending
      return a.lastUsedDaysAgo - b.lastUsedDaysAgo;
    })
    .slice(0, limit);
}
