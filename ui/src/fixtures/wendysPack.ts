// src/fixtures/wendysPack.ts
// Wendy's brand pack - structure-accurate fixtures matching the pack spec
// Source of truth: docs/fixtures/wendys_pack_spec.md

// ============================================
// BRAND
// ============================================

export const wendysBrand = {
  id: "brand_wendys",
  slug: "wendys",
  name: "Wendy's",
  vertical: "QSR / fast food",
  voice_traits: ["snarky", "playful roast", "fast timing", "confident", "punchy"],
  pillars: [
    "freshness flex",
    "competitor roast",
    "menu innovation",
    "fan banter",
    "culture hijack (safe)",
  ],
  personas: ["social manager", "brand lead", "agency creative"],
  guardrails: {
    do: [
      "roast like a human",
      "keep it short",
      "win the comments",
      "anchor to food truth (fresh)",
    ],
    dont: [
      "politics",
      "punch down",
      "sensitive tragedies",
      "fake claims about competitors",
    ],
  },
  format_playbook: [
    {
      format: "comment_stunt" as const,
      why_it_works:
        "wendy's wins by being first in replies; attention flows to the funniest reply.",
      examples: ["ratio a bland brand announcement with a single-line roast"],
    },
    {
      format: "thread" as const,
      why_it_works:
        "lets you stack jokes + product truth + CTA without feeling like an ad.",
      examples: ["3-part thread: roast -> freshness claim -> menu CTA"],
    },
    {
      format: "shortform_video" as const,
      why_it_works: "fast culture capture; sound/visual meme does the work.",
      examples: ["reel: 'fresh not frozen' done as a 5s punchline"],
    },
    {
      format: "meme_static" as const,
      why_it_works:
        "cheap + fast; can ship within minutes when the trend is peaking.",
      examples: ["screenshot meme with wendy's caption as the twist"],
    },
    {
      format: "carousel" as const,
      why_it_works:
        "useful for 'menu truth' and comparisons without looking defensive.",
      examples: ["carousel: 'how we keep it fresh' in 5 slides"],
    },
    {
      format: "founder_voice_post" as const,
      why_it_works:
        "for linkedin-style brand POV; less roast, more 'confident stance'.",
      examples: ["'why we don't compromise on fresh' as a POV post"],
    },
  ],
} as const;

// ============================================
// EVIDENCE
// ============================================

export const wendysEvidence = [
  // Trend cluster placeholder (swap later with real audio/hashtag ids)
  {
    id: "ev_tk_001",
    platform: "tiktok" as const,
    content_type: "video" as const,
    format: "short_video" as const,
    canonical_url: "https://tiktok.com/@placeholder/video/001",
    thumbnail_url: "https://picsum.photos/seed/tk001/640/360",
    author_handle: "@creator_one",
    created_at: "2025-12-23T14:10:00Z",
    captured_at: "2025-12-23T15:00:00Z",
    caption: "placeholder trend: everyone doing the same punchline format",
    metrics: { views: 1200000, likes: 85000, comments: 3200, shares: 4100 },
    cluster_keys: [
      {
        type: "audio_id" as const,
        value: "tiktok:audio:PLACEHOLDER_1",
        role: "primary" as const,
      },
      {
        type: "hashtag" as const,
        value: "#placeholdertrend",
        role: "secondary" as const,
      },
    ],
    extracted: {
      hashtags: ["#placeholdertrend", "#fyp"],
      audio_title: "placeholder audio",
    },
  },
  {
    id: "ev_ig_002",
    platform: "instagram" as const,
    content_type: "video" as const,
    format: "short_video" as const,
    canonical_url: "https://instagram.com/reel/placeholder002",
    thumbnail_url: "https://picsum.photos/seed/ig002/640/360",
    author_handle: "@creator_two",
    created_at: "2025-12-23T13:40:00Z",
    captured_at: "2025-12-23T14:30:00Z",
    caption: "same format, different niche. indicates cross-audience spread.",
    metrics: { views: 640000, likes: 42000, comments: 1400, shares: 900 },
    cluster_keys: [
      {
        type: "audio_id" as const,
        value: "instagram:audio:PLACEHOLDER_1",
        role: "primary" as const,
      },
      {
        type: "phrase" as const,
        value: "punchline cut format",
        role: "secondary" as const,
      },
    ],
    extracted: {
      hashtags: ["#reels", "#trend"],
      audio_title: "placeholder audio (ig)",
    },
  },

  // Evergreen / brand-adjacent evidence
  {
    id: "ev_web_003",
    platform: "web" as const,
    content_type: "link" as const,
    format: "post" as const,
    canonical_url: "https://example.com/freshness-claim-explainer",
    thumbnail_url: null,
    author_handle: null,
    created_at: "2025-12-22T18:00:00Z",
    captured_at: "2025-12-22T19:00:00Z",
    caption:
      "background context: consumer obsession with 'fresh' and authenticity",
    metrics: {},
    cluster_keys: [
      { type: "entity" as const, value: "entity:freshness", role: "primary" as const },
    ],
    extracted: { entities: ["freshness", "qsr"] },
  },

  // Competitive evidence placeholders
  {
    id: "ev_x_004",
    platform: "x" as const,
    content_type: "text" as const,
    format: "post" as const,
    canonical_url: "https://x.com/placeholder/status/004",
    thumbnail_url: null,
    author_handle: "@competitor_brand",
    created_at: "2025-12-23T12:05:00Z",
    captured_at: "2025-12-23T12:30:00Z",
    caption:
      "competitor posted a bland product announcement; comments are roasting it",
    metrics: { likes: 12000, comments: 1900, shares: 800 },
    cluster_keys: [
      {
        type: "entity" as const,
        value: "entity:competitor_announcement",
        role: "primary" as const,
      },
    ],
    extracted: { entities: ["competitor_brand"] },
  },

  // Additional evidence for richer display
  {
    id: "ev_tk_005",
    platform: "tiktok" as const,
    content_type: "video" as const,
    format: "short_video" as const,
    canonical_url: "https://tiktok.com/@creator_three/video/005",
    thumbnail_url: "https://picsum.photos/seed/tk005/640/360",
    author_handle: "@creator_three",
    created_at: "2025-12-23T11:20:00Z",
    captured_at: "2025-12-23T12:00:00Z",
    caption: "jumping on this trend before it peaks 🔥",
    metrics: { views: 890000, likes: 67000, comments: 2100, shares: 3200 },
    cluster_keys: [
      {
        type: "audio_id" as const,
        value: "tiktok:audio:PLACEHOLDER_1",
        role: "primary" as const,
      },
    ],
    extracted: {
      hashtags: ["#trend", "#viral"],
      audio_title: "placeholder audio",
    },
  },

  {
    id: "ev_ig_006",
    platform: "instagram" as const,
    content_type: "image" as const,
    format: "meme" as const,
    canonical_url: "https://instagram.com/p/meme006",
    thumbnail_url: "https://picsum.photos/seed/ig006/640/640",
    author_handle: "@meme_page",
    created_at: "2025-12-23T10:00:00Z",
    captured_at: "2025-12-23T11:00:00Z",
    caption: "when they say frozen is the same 💀",
    metrics: { views: 320000, likes: 28000, comments: 890, shares: 1200 },
    cluster_keys: [
      {
        type: "phrase" as const,
        value: "fresh vs frozen",
        role: "primary" as const,
      },
    ],
    extracted: {
      hashtags: ["#meme", "#food"],
    },
  },
] as const;

// ============================================
// OPPORTUNITIES
// ============================================

export const wendysOpportunities = [
  {
    id: "opp_001",
    type: "trend" as const,
    score: 86,
    title: "turn the 'punchline cut' trend into a wendy's roast in under 30 minutes",
    hook: "the format is peaking; wendy's can own it by flipping the punchline onto 'fresh not frozen'.",
    why_now: [
      "format is showing cross-platform spread (tiktok -> ig)",
      "low production cost: 1 shot + caption",
      "window is short; late entries feel cringe",
    ],
    why_now_summary: "Trend is spiking cross-platform with a 6-hour window",
    lifecycle: "rising" as const,
    trend_kernel: { kind: "audio" as const, value: "placeholder audio" },
    platforms: ["tiktok", "instagram"] as const,
    format_target: ["shortform_video", "meme_static", "comment_stunt"] as const,
    brand_fit: {
      persona: "social manager",
      pillar: "culture hijack (safe)",
      voice_reason: "this trend rewards fast, punchy humor",
    },
    evidence_ids: ["ev_tk_001", "ev_ig_002", "ev_tk_005"],
    signals: {
      velocity_label: "spiking",
      lifecycle: "rising",
      confidence: "high",
    },
    status: "new" as const,
  },
  {
    id: "opp_002",
    type: "competitive" as const,
    score: 78,
    title: "quote-tweet competitor's bland announcement with a one-line dagger",
    hook: "the comments are already doing the work; wendy's just needs the best line.",
    why_now: [
      "competitor post is live and getting dunked on",
      "wendy's has legacy permission to roast",
      "fast win: 1 line, no asset production",
    ],
    why_now_summary: "Competitor is getting roasted in replies right now",
    lifecycle: "peaking" as const,
    trend_kernel: { kind: "phrase" as const, value: "competitor announcement" },
    platforms: ["x"] as const,
    format_target: ["comment_stunt", "thread"] as const,
    brand_fit: {
      persona: "social manager",
      pillar: "competitor roast",
      voice_reason: "direct, comedic contrast plays to brand identity",
    },
    evidence_ids: ["ev_x_004"],
    signals: {
      velocity_label: "steady",
      lifecycle: "active",
      confidence: "medium",
    },
    status: "new" as const,
  },
  {
    id: "opp_003",
    type: "evergreen" as const,
    score: 74,
    title: "carousel: 'how we keep it fresh' without sounding defensive",
    hook: "educational format that converts skeptics and arms fans with receipts.",
    why_now: [
      "evergreen asset that can be reposted quarterly",
      "supports future trend hijacks by giving a 'truth anchor'",
    ],
    why_now_summary: "Reusable asset that supports future trend plays",
    lifecycle: "evergreen" as const,
    platforms: ["instagram", "linkedin"] as const,
    format_target: ["carousel", "founder_voice_post"] as const,
    brand_fit: {
      persona: "brand lead",
      pillar: "freshness flex",
      voice_reason: "less roast, more confident truth",
    },
    evidence_ids: ["ev_web_003", "ev_ig_006"],
    signals: {
      velocity_label: "n/a",
      lifecycle: "evergreen",
      confidence: "high",
    },
    status: "new" as const,
  },
  {
    id: "opp_004",
    type: "trend" as const,
    score: 71,
    title: "meme-static riff on a recurring caption template (fast IG story repost)",
    hook: "lightweight meme that fans repost; easiest way to stay 'in the feed'.",
    why_now: ["template is currently circulating; good timing for a brand twist"],
    why_now_summary: "Meme template circulating - easy brand twist opportunity",
    lifecycle: "seed" as const,
    trend_kernel: { kind: "phrase" as const, value: "caption template" },
    platforms: ["instagram"] as const,
    format_target: ["meme_static"] as const,
    brand_fit: {
      persona: "social manager",
      pillar: "fan banter",
      voice_reason: "wendy's punchlines work best as single-image captions",
    },
    evidence_ids: ["ev_ig_002", "ev_ig_006"],
    signals: {
      velocity_label: "warming",
      lifecycle: "seed",
      confidence: "low",
    },
    status: "new" as const,
  },
  {
    id: "opp_005",
    type: "evergreen" as const,
    score: 69,
    title: "thread: 3 'freshness myths' + 1 roast + CTA",
    hook: "structure keeps it entertaining while still selling.",
    why_now: ["works any week; gives writers a reusable scaffold"],
    why_now_summary: "Evergreen scaffold for balanced humor + truth",
    lifecycle: "evergreen" as const,
    platforms: ["x"] as const,
    format_target: ["thread"] as const,
    brand_fit: {
      persona: "agency creative",
      pillar: "freshness flex",
      voice_reason: "lets you balance humor and truth",
    },
    evidence_ids: ["ev_web_003"],
    signals: {
      velocity_label: "n/a",
      lifecycle: "evergreen",
      confidence: "high",
    },
    status: "new" as const,
  },
  {
    id: "opp_006",
    type: "competitive" as const,
    score: 66,
    title: "react to competitor promo with 'we'll wait' + fresh flex",
    hook: "simple reaction that invites fan pile-on.",
    why_now: ["competitive moments recur; template should exist in the system"],
    why_now_summary: "Template for recurring competitive moments",
    lifecycle: "active" as const,
    platforms: ["x"] as const,
    format_target: ["comment_stunt"] as const,
    brand_fit: {
      persona: "social manager",
      pillar: "competitor roast",
      voice_reason: "minimal words, maximum bite",
    },
    evidence_ids: ["ev_x_004"],
    signals: {
      velocity_label: "n/a",
      lifecycle: "active",
      confidence: "medium",
    },
    status: "new" as const,
  },
] as const;

// ============================================
// PACKAGES
// ============================================

export const wendysPackages = [
  {
    id: "pkg_001",
    opportunity_id: "opp_001",
    title: "the punchline-cut trend, but the punchline is 'fresh not frozen'",
    thesis:
      "use the exact trending format, then twist it into a wendy's roast that anchors to a real product truth.",
    outline_beats: [
      "cold open: set expectation (copy the trend's setup)",
      "micro-pause (beat where the audience expects the original punchline)",
      "wendy's twist punchline (fresh-not-frozen flex)",
      "tagline on-screen",
      "caption that invites comments ('say it louder for the frozen patties in the back')",
    ],
    cta: "comment with your 'frozen patty' hot take",
    format: "shortform_video" as const,
    deliverables: [
      { channel: "tiktok" as const, variant_id: "var_001", label: "tiktok cut (7s)" },
      { channel: "instagram" as const, variant_id: "var_002", label: "reels cut (8s)" },
      { channel: "x" as const, variant_id: "var_003", label: "1-liner follow-up post" },
    ],
    variants: [
      {
        id: "var_001",
        channel: "tiktok" as const,
        status: "draft" as const,
        body: "script: [trend setup] -> [pause] -> 'fresh not frozen' twist. caption: 'frozen patties couldn't.'",
        notes: "keep it under 9s. punchline must hit by second 6.",
        score: 82,
      },
      {
        id: "var_002",
        channel: "instagram" as const,
        status: "draft" as const,
        body: "same script; caption slightly less aggressive; add 'fresh is a choice.'",
        notes: "avoid direct competitor naming in caption.",
        score: 76,
      },
      {
        id: "var_003",
        channel: "x" as const,
        status: "draft" as const,
        body: "we tried the trend. then remembered we're not frozen.",
        notes: "post within 15 min of video publish.",
        score: 71,
      },
    ],
    evidence_refs: ["ev_tk_001", "ev_ig_002"],
    quality: { score: 85, band: "good" as const, issues: [] },
  },
  {
    id: "pkg_002",
    opportunity_id: "opp_003",
    title: "carousel: how we keep it fresh (without begging you to believe us)",
    thesis:
      "a clean, confident explainer that fans can share as 'receipts' when debates happen.",
    outline_beats: [
      "slide 1: claim (short + bold)",
      "slide 2: what 'fresh' means operationally (simple)",
      "slide 3: what we refuse to do (guardrail framing)",
      "slide 4: fan-friendly 'how to spot it' tip",
      "slide 5: CTA: 'argue about it in the comments'",
    ],
    cta: "save this for the next 'fresh vs frozen' debate",
    format: "carousel" as const,
    deliverables: [
      {
        channel: "instagram" as const,
        variant_id: "var_004",
        label: "IG carousel (5 slides)",
      },
      {
        channel: "linkedin" as const,
        variant_id: "var_005",
        label: "LinkedIn doc-style carousel",
      },
    ],
    variants: [
      {
        id: "var_004",
        channel: "instagram" as const,
        status: "draft" as const,
        body: "slide copy bullets + design notes (big type, minimal words).",
        notes: "make it screenshotable. avoid dunking tone.",
        score: 73,
      },
      {
        id: "var_005",
        channel: "linkedin" as const,
        status: "draft" as const,
        body: "POV framing + doc carousel. less roast, more brand confidence.",
        notes: "tone shift: 'we take quality seriously'.",
        score: 68,
      },
    ],
    evidence_refs: ["ev_web_003"],
    quality: {
      score: 72,
      band: "partial" as const,
      issues: ["needs stronger proof points", "cta could be sharper"],
    },
  },
] as const;

// ============================================
// PATTERNS (kept from existing demo, but renamed)
// TODO(spec): patterns may need revision to match spec format taxonomy
// ============================================

export const wendysPatterns = [
  {
    id: "pat_001",
    name: "Confessional story -> lesson",
    description:
      "Open with a vulnerable admission or behind-the-scenes moment, then pivot to actionable insight.",
    structure: "Hook (confession) -> Context -> Turning point -> Lesson -> CTA",
    beats: ["Hook", "Context", "Twist", "Lesson"],
    exampleHook:
      "I've sat in dozens of board meetings where CMOs lost the attribution argument...",
    usageCount: 28,
    avgEngagement: 4.2,
    channels: ["linkedin"],
    performanceHint: "31% click-through on LinkedIn - Best for CMO persona",
    status: "active" as const,
    category: "evergreen" as const,
    lastUsedDaysAgo: 1,
  },
  {
    id: "pat_002",
    name: "Hot take -> thread",
    description:
      "Lead with a bold, potentially controversial opinion, then unpack it with nuance in a thread.",
    structure: "Hot take -> Nuance -> Evidence -> Counter-arguments -> Conclusion",
    beats: ["Take", "Nuance", "Evidence", "Close"],
    exampleHook:
      "Hot take: Your attribution dashboard is why you're losing budget battles.",
    usageCount: 24,
    avgEngagement: 5.1,
    channels: ["x"],
    performanceHint: "2.4x retweets vs. average - Best for X",
    status: "active" as const,
    category: "engagement" as const,
    lastUsedDaysAgo: 1,
  },
  {
    id: "pat_003",
    name: "Contrarian hook -> framework",
    description:
      "Challenge conventional wisdom, then provide a structured alternative approach.",
    structure:
      "Contrarian statement -> Why it's wrong -> Your framework -> Examples -> Takeaway",
    beats: ["Hot take", "Why", "Framework", "CTA"],
    exampleHook: "Stop reporting on MQLs. Seriously. Your CEO doesn't care.",
    usageCount: 19,
    avgEngagement: 3.8,
    channels: ["linkedin", "x"],
    performanceHint: "High engagement with CMO persona - Drives comments",
    status: "active" as const,
    category: "engagement" as const,
    lastUsedDaysAgo: 2,
  },
  {
    id: "pat_004",
    name: "Behind the curtain -> thread",
    description:
      "Pull back the curtain on process, failures, or decisions. Authenticity-first storytelling.",
    structure:
      "Tease the reveal -> The reality -> What you learned -> What you'd do differently",
    beats: ["Tease", "Reality", "Lesson", "Next"],
    exampleHook: "That video that got 2M views? Here's what you didn't see...",
    usageCount: 16,
    avgEngagement: 4.8,
    channels: ["x", "tiktok", "instagram"],
    performanceHint: "High saves and bookmarks - 2.1x shares vs. average",
    status: "active" as const,
    category: "evergreen" as const,
    lastUsedDaysAgo: 2,
  },
  {
    id: "pat_005",
    name: "List -> honest review",
    description:
      "Structured list format with genuine opinions, including negatives. No fluff.",
    structure: "Context -> List items with verdicts -> Summary recommendation",
    beats: ["Context", "List", "Verdict"],
    exampleHook: "Gear I bought this year: Kept / Returned / Jury's out",
    usageCount: 18,
    avgEngagement: 3.9,
    channels: ["x", "linkedin"],
    performanceHint: "Saves on X - High bookmark rate",
    status: "active" as const,
    category: "education" as const,
    lastUsedDaysAgo: 5,
  },
  {
    id: "pat_006",
    name: "Problem -> solution -> proof",
    description:
      "Classic problem-agitate-solve structure with data or testimonial proof.",
    structure: "Pain point -> Agitate -> Solution -> Evidence -> CTA",
    beats: ["Problem", "Agitate", "Solution", "Proof"],
    exampleHook:
      "RevOps teams spend 12 hours/week on manual reporting. Here's what the top 10% do differently.",
    usageCount: 6,
    avgEngagement: 3.6,
    channels: ["linkedin"],
    performanceHint: "Strong for RevOps persona - Underused opportunity",
    status: "active" as const,
    category: "education" as const,
    lastUsedDaysAgo: 14,
  },
  {
    id: "pat_007",
    name: "Analogy -> insight",
    description:
      "Use a familiar concept to explain a complex idea, making it instantly relatable.",
    structure: "Analogy intro -> Connection to topic -> Deeper insight -> Application",
    beats: ["Analogy", "Connect", "Insight"],
    exampleHook:
      "Last-touch attribution is like giving the closer all credit for a team sale.",
    usageCount: 8,
    avgEngagement: 3.4,
    channels: ["linkedin", "x"],
    performanceHint: "Works well for technical topics - Low competition",
    status: "active" as const,
    category: "education" as const,
    lastUsedDaysAgo: 12,
  },
  {
    id: "pat_008",
    name: "Transformation reveal",
    description:
      "Before/after showcase that proves value through visual or measurable change.",
    structure: "The before -> The challenge -> The process -> The after -> Results",
    beats: ["Before", "Challenge", "Process", "After"],
    exampleHook: "This local bakery's brand was invisible. Here's what changed...",
    usageCount: 3,
    avgEngagement: 4.1,
    channels: ["x", "tiktok", "instagram"],
    performanceHint: "High for client work showcases - Underused",
    status: "active" as const,
    category: "launch" as const,
    lastUsedDaysAgo: 28,
  },
  {
    id: "pat_009",
    name: "Announcement -> context -> CTA",
    description:
      "Direct announcement format for launches and news, with context and clear next step.",
    structure: "Big news -> Why it matters -> What's next -> CTA",
    beats: ["News", "Context", "Impact", "CTA"],
    exampleHook: "We just launched [thing]. Here's why it matters...",
    usageCount: 4,
    avgEngagement: 2.9,
    channels: ["linkedin", "x"],
    performanceHint: "Best for major announcements - Keep it rare",
    status: "active" as const,
    category: "launch" as const,
    lastUsedDaysAgo: 35,
  },
  {
    id: "pat_010",
    name: "Myth vs reality",
    description: "Challenge common misconceptions with evidence-backed truth.",
    structure: "Common belief -> Why it's wrong -> The reality -> Takeaway",
    beats: ["Myth", "Problem", "Reality", "Lesson"],
    exampleHook: "Everyone says MQLs matter. Here's why that's wrong...",
    usageCount: 2,
    avgEngagement: 4.0,
    channels: ["linkedin"],
    performanceHint: "Testing phase - early positive signals",
    status: "experimental" as const,
    category: "education" as const,
    lastUsedDaysAgo: 21,
  },
] as const;
