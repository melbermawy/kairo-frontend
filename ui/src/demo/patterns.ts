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
  {
    id: "pat_001",
    name: "Confessional story → lesson",
    description: "Open with a vulnerable admission or behind-the-scenes moment, then pivot to actionable insight.",
    structure: "Hook (confession) → Context → Turning point → Lesson → CTA",
    beats: ["Hook", "Context", "Twist", "Lesson"],
    exampleHook: "I made a $50K mistake last quarter. Here's what I learned...",
    usageCount: 24,
    avgEngagement: 4.2,
    channels: ["LinkedIn"],
    performanceHint: "↑ 23% click-through on LinkedIn last 30 days",
    status: "active",
    category: "evergreen",
    lastUsedDaysAgo: 2,
  },
  {
    id: "pat_002",
    name: "Contrarian hook → framework",
    description: "Challenge conventional wisdom, then provide a structured alternative approach.",
    structure: "Contrarian statement → Why it's wrong → Your framework → Examples → Takeaway",
    beats: ["Hot take", "Why", "Framework", "CTA"],
    exampleHook: "Everything you know about [X] is wrong...",
    usageCount: 18,
    avgEngagement: 3.8,
    channels: ["LinkedIn", "X"],
    performanceHint: "↑ High engagement with CMO persona",
    status: "active",
    category: "engagement",
    lastUsedDaysAgo: 5,
  },
  {
    id: "pat_003",
    name: "Hot take → thread",
    description: "Lead with a bold, potentially controversial opinion, then unpack it with nuance.",
    structure: "Hot take → Nuance → Evidence → Counter-arguments → Conclusion",
    beats: ["Take", "Nuance", "Evidence", "Close"],
    exampleHook: "Unpopular opinion: [bold claim]",
    usageCount: 31,
    avgEngagement: 5.1,
    channels: ["X"],
    performanceHint: "↑ 2.1x retweets on X",
    status: "active",
    category: "engagement",
    lastUsedDaysAgo: 1,
  },
  {
    id: "pat_004",
    name: "Analogy → insight",
    description: "Use a familiar concept to explain a complex idea, making it instantly relatable.",
    structure: "Analogy intro → Connection to topic → Deeper insight → Application",
    beats: ["Analogy", "Connect", "Insight"],
    exampleHook: "[Complex thing] is like [simple thing]...",
    usageCount: 15,
    avgEngagement: 3.4,
    channels: ["LinkedIn", "X"],
    performanceHint: "Works well for technical topics",
    status: "active",
    category: "education",
    lastUsedDaysAgo: 8,
  },
  {
    id: "pat_005",
    name: "Behind the curtain → thread",
    description: "Pull back the curtain on process, failures, or decisions. Authenticity-first.",
    structure: "Tease the reveal → The reality → What you learned → What you'd do differently",
    beats: ["Tease", "Reality", "Lesson", "Next"],
    exampleHook: "Here's what actually happened when...",
    usageCount: 12,
    avgEngagement: 4.8,
    channels: ["X", "YouTube Shorts"],
    performanceHint: "↑ High saves and bookmarks",
    status: "experimental",
    category: "evergreen",
    lastUsedDaysAgo: 3,
  },
  {
    id: "pat_006",
    name: "List → honest review",
    description: "Structured list format with genuine opinions, including negatives.",
    structure: "Context → List items with verdicts → Summary recommendation",
    beats: ["Context", "List", "Verdict"],
    exampleHook: "I tested 10 [things]. Here's what's actually worth it:",
    usageCount: 22,
    avgEngagement: 3.9,
    channels: ["X", "LinkedIn"],
    performanceHint: "↑ Saves on X threads",
    status: "active",
    category: "education",
    lastUsedDaysAgo: 4,
  },
  {
    id: "pat_007",
    name: "Problem → solution → proof",
    description: "Classic problem-agitate-solve structure with data or testimonial proof.",
    structure: "Pain point → Agitate → Solution → Evidence → CTA",
    beats: ["Problem", "Agitate", "Solution", "Proof"],
    exampleHook: "Tired of [pain point]? Here's what actually works...",
    usageCount: 8,
    avgEngagement: 3.2,
    channels: ["LinkedIn"],
    performanceHint: "Strong for product launches",
    status: "active",
    category: "launch",
    lastUsedDaysAgo: 12,
  },
  {
    id: "pat_008",
    name: "Announcement → context → CTA",
    description: "Direct announcement format for launches and news, with context and clear next step.",
    structure: "Big news → Why it matters → What's next → CTA",
    beats: ["News", "Context", "Impact", "CTA"],
    exampleHook: "We just shipped [feature]. Here's why it matters...",
    usageCount: 5,
    avgEngagement: 2.8,
    channels: ["LinkedIn", "X"],
    performanceHint: "Best for major announcements",
    status: "experimental",
    category: "launch",
    lastUsedDaysAgo: 21,
  },
  {
    id: "pat_009",
    name: "Myth vs reality",
    description: "Challenge common misconceptions with evidence-backed truth.",
    structure: "Common belief → Why it's wrong → The reality → Takeaway",
    beats: ["Myth", "Problem", "Reality", "Lesson"],
    exampleHook: "Everyone says [myth]. Here's why that's wrong...",
    usageCount: 3,
    avgEngagement: 4.0,
    channels: ["LinkedIn"],
    performanceHint: "Testing phase - early positive signals",
    status: "deprecated",
    category: "education",
    lastUsedDaysAgo: 45,
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
 * 2. usageCount descending
 * 3. lastUsedDaysAgo ascending (more recent wins)
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
