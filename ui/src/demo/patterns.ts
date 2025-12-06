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
