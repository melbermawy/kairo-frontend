export interface DemoPattern {
  id: string;
  name: string;
  description: string;
  structure: string;
  exampleHook: string;
  usageCount: number;
  avgEngagement: number;
  channels: string[];
}

export const demoPatterns: DemoPattern[] = [
  {
    id: "pat_001",
    name: "Confessional story → lesson",
    description: "Open with a vulnerable admission or behind-the-scenes moment, then pivot to actionable insight.",
    structure: "Hook (confession) → Context → Turning point → Lesson → CTA",
    exampleHook: "I made a $50K mistake last quarter. Here's what I learned...",
    usageCount: 24,
    avgEngagement: 4.2,
    channels: ["LinkedIn"],
  },
  {
    id: "pat_002",
    name: "Contrarian hook → framework",
    description: "Challenge conventional wisdom, then provide a structured alternative approach.",
    structure: "Contrarian statement → Why it's wrong → Your framework → Examples → Takeaway",
    exampleHook: "Everything you know about [X] is wrong...",
    usageCount: 18,
    avgEngagement: 3.8,
    channels: ["LinkedIn", "X"],
  },
  {
    id: "pat_003",
    name: "Hot take → thread",
    description: "Lead with a bold, potentially controversial opinion, then unpack it with nuance.",
    structure: "Hot take → Nuance → Evidence → Counter-arguments → Conclusion",
    exampleHook: "Unpopular opinion: [bold claim]",
    usageCount: 31,
    avgEngagement: 5.1,
    channels: ["X"],
  },
  {
    id: "pat_004",
    name: "Analogy → insight",
    description: "Use a familiar concept to explain a complex idea, making it instantly relatable.",
    structure: "Analogy intro → Connection to topic → Deeper insight → Application",
    exampleHook: "[Complex thing] is like [simple thing]...",
    usageCount: 15,
    avgEngagement: 3.4,
    channels: ["LinkedIn", "X"],
  },
  {
    id: "pat_005",
    name: "Behind the curtain → thread",
    description: "Pull back the curtain on process, failures, or decisions. Authenticity-first.",
    structure: "Tease the reveal → The reality → What you learned → What you'd do differently",
    exampleHook: "Here's what actually happened when...",
    usageCount: 12,
    avgEngagement: 4.8,
    channels: ["X", "YouTube Shorts"],
  },
  {
    id: "pat_006",
    name: "List → honest review",
    description: "Structured list format with genuine opinions, including negatives.",
    structure: "Context → List items with verdicts → Summary recommendation",
    exampleHook: "I tested 10 [things]. Here's what's actually worth it:",
    usageCount: 22,
    avgEngagement: 3.9,
    channels: ["X", "LinkedIn"],
  },
];

export function getAllPatterns(): DemoPattern[] {
  return demoPatterns;
}

export function getPatternById(id: string): DemoPattern | undefined {
  return demoPatterns.find((p) => p.id === id);
}
