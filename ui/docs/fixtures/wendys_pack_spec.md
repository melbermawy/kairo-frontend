# Wendy's Pack Spec

## 0. Guardrails (Don't Screw Ourselves)

- This pack is not "accurate live trends". It's structure-accurate and density-accurate so the UI survives real ingestion later.
- Every opportunity must have evidence (mixed media) + a format target + a why_now that reads like an operator wrote it.
- Formats > channels. Channel is just distribution.

---

## 1. Format Taxonomy (Phase-1 Only)

Use these enum values everywhere:

| Format | Description |
|--------|-------------|
| `shortform_video` | TikTok / IG Reels |
| `meme_static` | Image macro / screenshot-meme |
| `carousel` | IG carousel / LinkedIn doc-style |
| `thread` | X thread / LinkedIn multi-paragraph |
| `comment_stunt` | Reply/quote/reaction that hijacks attention |
| `founder_voice_post` | LinkedIn-style "take" in brand voice |

---

## 2. DTO Subset We'll Render in V0 (Frontend Contract)

### Brand

- `id`, `slug`, `name`, `vertical`
- `voice_traits[]`
- `pillars[]`
- `personas[]`
- `guardrails`: `{ do[], dont[] }`
- `format_playbook`: `{ format, why_it_works, examples[] }[]`

### Evidence Item

- `id`
- `platform`: `"tiktok" | "instagram" | "x" | "reddit" | "web"`
- `content_type`: `"video" | "image" | "text" | "link"`
- `canonical_url`
- `thumbnail_url?`
- `author_handle?`
- `created_at`
- `caption?`
- `metrics`: `{ views?, likes?, comments?, shares? }`
- `cluster_keys`: `{ type: "audio_id" | "hashtag" | "phrase" | "entity", value: string, role: "primary" | "secondary" }[]`
- `extracted`: `{ entities?: string[], hashtags?: string[], audio_title?: string }`

### Opportunity (Card + Detail)

- `id`, `type`: `"trend" | "evergreen" | "competitive"`
- `score`: 0-100
- `title` (operator-readable)
- `hook` (1 line)
- `why_now` (2-4 bullets)
- `format_target`: `FormatTaxonomy[]`
- `brand_fit`: `{ persona, pillar, voice_reason }`
- `evidence`: `EvidenceItem[]` (6-10)
- `signals`: `{ velocity_label, lifecycle, confidence }` (strings ok for now)
- `status`: `"new" | "saved" | "packaged" | "dismissed"`

### Content Package

- `id`, `opportunity_id`
- `title`
- `thesis`
- `outline_beats[]` (5-9)
- `cta`
- `format`: `FormatTaxonomy` (single primary)
- `deliverables`: `{ channel: "x" | "linkedin" | "instagram" | "tiktok", variant_id, label }[]`
- `variants`: `{ id, channel, status, body, notes?, score? }[]`
- `evidence_refs`: `string[]` (evidence ids)
- `quality`: `{ score, band, issues[] }`

---

## 3. Wendy's Brand Pack (Actual Content)

### Brand Strategy (Tight)

- **voice_traits**: `["snarky", "playful roast", "fast timing", "confident", "punchy"]`
- **pillars**: `["freshness flex", "competitor roast", "menu innovation", "fan banter", "culture hijack (safe)"]`
- **personas**: `["social manager", "brand lead", "agency creative"]`

**Guardrails:**

| Do | Don't |
|----|-------|
| Roast like a human | Politics |
| Keep it short | Punch down |
| Win the comments | Sensitive tragedies |
| Anchor to food truth (fresh) | Fake claims about competitors |

**Format Playbook** (6 rows): One per format taxonomy, each with why + 1 example title.

---

## 4. The Pack: 6 Opportunities + 2 Packages

Below is a copy-paste TypeScript fixture you can drop into `src/demo/` (but we're going to rename `demo` -> `fixtures` and kill the "demo universe" framing).

### `wendysPack.ts` (Fixtures)

```typescript
export const wendysBrand = {
  id: "brand_wendys",
  slug: "wendys",
  name: "Wendy's",
  vertical: "QSR / fast food",
  voice_traits: ["snarky", "playful roast", "fast timing", "confident", "punchy"],
  pillars: ["freshness flex", "competitor roast", "menu innovation", "fan banter", "culture hijack (safe)"],
  personas: ["social manager", "brand lead", "agency creative"],
  guardrails: {
    do: ["roast like a human", "keep it short", "win the comments", "anchor to food truth (fresh)"],
    dont: ["politics", "punch down", "sensitive tragedies", "fake claims about competitors"],
  },
  format_playbook: [
    {
      format: "comment_stunt",
      why_it_works: "wendy's wins by being first in replies; attention flows to the funniest reply.",
      examples: ["ratio a bland brand announcement with a single-line roast"],
    },
    {
      format: "thread",
      why_it_works: "lets you stack jokes + product truth + CTA without feeling like an ad.",
      examples: ["3-part thread: roast → freshness claim → menu CTA"],
    },
    {
      format: "shortform_video",
      why_it_works: "fast culture capture; sound/visual meme does the work.",
      examples: ["reel: 'fresh not frozen' done as a 5s punchline"],
    },
    {
      format: "meme_static",
      why_it_works: "cheap + fast; can ship within minutes when the trend is peaking.",
      examples: ["screenshot meme with wendy's caption as the twist"],
    },
    {
      format: "carousel",
      why_it_works: "useful for 'menu truth' and comparisons without looking defensive.",
      examples: ["carousel: 'how we keep it fresh' in 5 slides"],
    },
    {
      format: "founder_voice_post",
      why_it_works: "for linkedin-style brand POV; less roast, more 'confident stance'.",
      examples: ["'why we don't compromise on fresh' as a POV post"],
    },
  ],
} as const;

export const evidence = [
  // Trend cluster placeholder (swap later with real audio/hashtag ids)
  {
    id: "ev_tk_001",
    platform: "tiktok",
    content_type: "video",
    canonical_url: "https://tiktok.com/@placeholder/video/001",
    thumbnail_url: "https://picsum.photos/seed/tk001/640/360",
    author_handle: "@creator_one",
    created_at: "2025-12-23T14:10:00Z",
    caption: "placeholder trend: everyone doing the same punchline format",
    metrics: { views: 1200000, likes: 85000, comments: 3200, shares: 4100 },
    cluster_keys: [
      { type: "audio_id", value: "tiktok:audio:PLACEHOLDER_1", role: "primary" },
      { type: "hashtag", value: "tiktok:#placeholdertrend", role: "secondary" },
    ],
    extracted: { hashtags: ["#placeholdertrend", "#fyp"], audio_title: "placeholder audio" },
  },
  {
    id: "ev_ig_002",
    platform: "instagram",
    content_type: "video",
    canonical_url: "https://instagram.com/reel/placeholder002",
    thumbnail_url: "https://picsum.photos/seed/ig002/640/360",
    author_handle: "@creator_two",
    created_at: "2025-12-23T13:40:00Z",
    caption: "same format, different niche. indicates cross-audience spread.",
    metrics: { views: 640000, likes: 42000, comments: 1400, shares: 900 },
    cluster_keys: [
      { type: "audio_id", value: "instagram:audio:PLACEHOLDER_1", role: "primary" },
      { type: "phrase", value: "phrase:format_punchline_cut", role: "secondary" },
    ],
    extracted: { hashtags: ["#reels", "#trend"], audio_title: "placeholder audio (ig)" },
  },

  // Evergreen / brand-adjacent evidence
  {
    id: "ev_web_003",
    platform: "web",
    content_type: "link",
    canonical_url: "https://example.com/freshness-claim-explainer",
    created_at: "2025-12-22T18:00:00Z",
    caption: "background context: consumer obsession with 'fresh' and authenticity",
    metrics: {},
    cluster_keys: [{ type: "entity", value: "entity:freshness", role: "primary" }],
    extracted: { entities: ["freshness", "qsr"] },
  },

  // Competitive evidence placeholders
  {
    id: "ev_x_004",
    platform: "x",
    content_type: "text",
    canonical_url: "https://x.com/placeholder/status/004",
    author_handle: "@competitor_brand",
    created_at: "2025-12-23T12:05:00Z",
    caption: "competitor posted a bland product announcement; comments are roasting it",
    metrics: { likes: 12000, comments: 1900, shares: 800 },
    cluster_keys: [{ type: "entity", value: "entity:competitor_announcement", role: "primary" }],
    extracted: { entities: ["competitor_brand"] },
  },
] as const;

export const opportunities = [
  {
    id: "opp_001",
    type: "trend",
    score: 86,
    title: "turn the 'punchline cut' trend into a wendy's roast in under 30 minutes",
    hook: "the format is peaking; wendy's can own it by flipping the punchline onto 'fresh not frozen'.",
    why_now: [
      "format is showing cross-platform spread (tiktok → ig)",
      "low production cost: 1 shot + caption",
      "window is short; late entries feel cringe",
    ],
    format_target: ["shortform_video", "meme_static", "comment_stunt"],
    brand_fit: {
      persona: "social manager",
      pillar: "culture hijack (safe)",
      voice_reason: "this trend rewards fast, punchy humor",
    },
    evidence_ids: ["ev_tk_001", "ev_ig_002"],
    signals: { velocity_label: "spiking", lifecycle: "rising", confidence: "high" },
    status: "new",
  },
  {
    id: "opp_002",
    type: "competitive",
    score: 78,
    title: "quote-tweet competitor's bland announcement with a one-line dagger",
    hook: "the comments are already doing the work; wendy's just needs the best line.",
    why_now: [
      "competitor post is live and getting dunked on",
      "wendy's has legacy permission to roast",
      "fast win: 1 line, no asset production",
    ],
    format_target: ["comment_stunt", "thread"],
    brand_fit: {
      persona: "social manager",
      pillar: "competitor roast",
      voice_reason: "direct, comedic contrast plays to brand identity",
    },
    evidence_ids: ["ev_x_004"],
    signals: { velocity_label: "steady", lifecycle: "active", confidence: "medium" },
    status: "new",
  },
  {
    id: "opp_003",
    type: "evergreen",
    score: 74,
    title: "carousel: 'how we keep it fresh' without sounding defensive",
    hook: "educational format that converts skeptics and arms fans with receipts.",
    why_now: [
      "evergreen asset that can be reposted quarterly",
      "supports future trend hijacks by giving a 'truth anchor'",
    ],
    format_target: ["carousel", "founder_voice_post"],
    brand_fit: {
      persona: "brand lead",
      pillar: "freshness flex",
      voice_reason: "less roast, more confident truth",
    },
    evidence_ids: ["ev_web_003"],
    signals: { velocity_label: "n/a", lifecycle: "evergreen", confidence: "high" },
    status: "new",
  },
  {
    id: "opp_004",
    type: "trend",
    score: 71,
    title: "meme-static riff on a recurring caption template (fast IG story repost)",
    hook: "lightweight meme that fans repost; easiest way to stay 'in the feed'.",
    why_now: ["template is currently circulating; good timing for a brand twist"],
    format_target: ["meme_static"],
    brand_fit: {
      persona: "social manager",
      pillar: "fan banter",
      voice_reason: "wendy's punchlines work best as single-image captions",
    },
    evidence_ids: ["ev_ig_002"],
    signals: { velocity_label: "warming", lifecycle: "seed", confidence: "low" },
    status: "new",
  },
  {
    id: "opp_005",
    type: "evergreen",
    score: 69,
    title: "thread: 3 'freshness myths' + 1 roast + CTA",
    hook: "structure keeps it entertaining while still selling.",
    why_now: ["works any week; gives writers a reusable scaffold"],
    format_target: ["thread"],
    brand_fit: {
      persona: "agency creative",
      pillar: "freshness flex",
      voice_reason: "lets you balance humor and truth",
    },
    evidence_ids: ["ev_web_003"],
    signals: { velocity_label: "n/a", lifecycle: "evergreen", confidence: "high" },
    status: "new",
  },
  {
    id: "opp_006",
    type: "competitive",
    score: 66,
    title: "react to competitor promo with 'we'll wait' + fresh flex",
    hook: "simple reaction that invites fan pile-on.",
    why_now: ["competitive moments recur; template should exist in the system"],
    format_target: ["comment_stunt"],
    brand_fit: {
      persona: "social manager",
      pillar: "competitor roast",
      voice_reason: "minimal words, maximum bite",
    },
    evidence_ids: ["ev_x_004"],
    signals: { velocity_label: "n/a", lifecycle: "active", confidence: "medium" },
    status: "new",
  },
] as const;

export const packages = [
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
    format: "shortform_video",
    deliverables: [
      { channel: "tiktok", variant_id: "var_001", label: "tiktok cut (7s)" },
      { channel: "instagram", variant_id: "var_002", label: "reels cut (8s)" },
      { channel: "x", variant_id: "var_003", label: "1-liner follow-up post" },
    ],
    variants: [
      {
        id: "var_001",
        channel: "tiktok",
        status: "draft",
        body: "script: [trend setup] → [pause] → 'fresh not frozen' twist. caption: 'frozen patties couldn't.'",
        notes: "keep it under 9s. punchline must hit by second 6.",
        score: 82,
      },
      {
        id: "var_002",
        channel: "instagram",
        status: "draft",
        body: "same script; caption slightly less aggressive; add 'fresh is a choice.'",
        notes: "avoid direct competitor naming in caption.",
        score: 76,
      },
      {
        id: "var_003",
        channel: "x",
        status: "draft",
        body: "we tried the trend. then remembered we're not frozen.",
        notes: "post within 15 min of video publish.",
        score: 71,
      },
    ],
    evidence_refs: ["ev_tk_001", "ev_ig_002"],
    quality: { score: 85, band: "good", issues: [] },
  },
  {
    id: "pkg_002",
    opportunity_id: "opp_003",
    title: "carousel: how we keep it fresh (without begging you to believe us)",
    thesis: "a clean, confident explainer that fans can share as 'receipts' when debates happen.",
    outline_beats: [
      "slide 1: claim (short + bold)",
      "slide 2: what 'fresh' means operationally (simple)",
      "slide 3: what we refuse to do (guardrail framing)",
      "slide 4: fan-friendly 'how to spot it' tip",
      "slide 5: CTA: 'argue about it in the comments'",
    ],
    cta: "save this for the next 'fresh vs frozen' debate",
    format: "carousel",
    deliverables: [
      { channel: "instagram", variant_id: "var_004", label: "IG carousel (5 slides)" },
      { channel: "linkedin", variant_id: "var_005", label: "LinkedIn doc-style carousel" },
    ],
    variants: [
      {
        id: "var_004",
        channel: "instagram",
        status: "draft",
        body: "slide copy bullets + design notes (big type, minimal words).",
        notes: "make it screenshotable. avoid dunking tone.",
        score: 73,
      },
      {
        id: "var_005",
        channel: "linkedin",
        status: "draft",
        body: "POV framing + doc carousel. less roast, more brand confidence.",
        notes: "tone shift: 'we take quality seriously'.",
        score: 68,
      },
    ],
    evidence_refs: ["ev_web_003"],
    quality: {
      score: 72,
      band: "partial",
      issues: ["needs stronger proof points", "cta could be sharper"],
    },
  },
] as const;
```
