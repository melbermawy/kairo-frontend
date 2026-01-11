# Kairo Frontend System Context

> This document provides comprehensive context for AI assistants working on the Kairo frontend codebase. It describes the project structure, data models, design system, and architectural patterns.

---

## 1. Project Overview

**Kairo** is a social content intelligence platform that helps brands identify trending opportunities, create on-brand content packages, and maintain consistent voice across channels.

**Tech Stack:**
- **Framework:** Next.js 16.0.7 (App Router)
- **UI Library:** React 19.2.0
- **Styling:** Tailwind CSS v4 with custom design tokens
- **Animation:** Framer Motion 12.x
- **Validation:** Zod 4.x
- **Testing:** Vitest 3.x
- **Language:** TypeScript 5.x

**Current State:** Frontend UI with mock data (no real backend). All API calls go through a mock layer that returns fixture data validated by Zod schemas.

---

## 2. Directory Structure

```
ui/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── globals.css               # Design tokens & base styles
│   │   ├── layout.tsx                # Root layout with fonts
│   │   ├── page.tsx                  # Root redirect to /brands/:id/today
│   │   └── brands/
│   │       └── [brandId]/
│   │           ├── layout.tsx        # Brand shell with AppShell
│   │           ├── today/            # Today dashboard
│   │           ├── packages/         # Content packages pipeline
│   │           │   └── [packageId]/  # Package detail/editor
│   │           ├── patterns/         # Pattern library
│   │           └── strategy/         # Brand strategy view
│   │
│   ├── components/                   # Component library
│   │   ├── ui/                       # Primitives (KButton, KCard, KTag)
│   │   ├── layout/                   # AppShell, TopBar, BrandSidebar
│   │   ├── opportunities/            # Cards, Drawer, Evidence tiles
│   │   ├── packages/                 # Table, Row, Panels
│   │   ├── patterns/                 # Filters, Rows, Hero
│   │   ├── strategy/                 # Positioning, Personas, Pillars
│   │   ├── chat/                     # Chat drawer & messages
│   │   ├── content/                  # Pipeline visualization
│   │   ├── today/                    # Focus strip widget
│   │   └── theme/                    # ThemeProvider
│   │
│   ├── contracts/                    # Zod schemas (source of truth)
│   │   └── index.ts                  # All type definitions
│   │
│   ├── fixtures/                     # Mock data
│   │   ├── index.ts                  # Exports
│   │   └── wendysPack.ts             # Wendy's brand test data
│   │
│   └── lib/
│       └── mockApi/                  # Mock API layer
│           ├── client.ts             # API methods
│           ├── types.ts              # Re-exports from contracts
│           ├── errors.ts             # NotFoundError, ContractError
│           └── index.ts              # Main export
│
├── docs/                             # Documentation
└── package.json
```

---

## 3. Design Token System

All design tokens are defined in `src/app/globals.css` using CSS custom properties and mapped to Tailwind via `@theme inline`.

### 3.1 Color Palette (Dark Theme Default)

```css
/* Semantic Surfaces */
--kairo-color-bg-app:      #18181B   /* App background (Zinc-900) */
--kairo-color-bg-panel:    #1F1F23   /* Elevated panels */
--kairo-color-bg-card:     #27272A   /* Card surfaces */
--kairo-color-bg-elevated: #3F3F46   /* Hover/elevated elements */
--kairo-color-bg-hover:    #52525B   /* Hover state */

/* Borders */
--kairo-color-border-subtle: #3F3F46
--kairo-color-border-strong: #52525B

/* Foreground (Text) */
--kairo-color-fg:        #FAFAFA    /* Primary text */
--kairo-color-fg-muted:  #A1A1AA    /* Secondary text */
--kairo-color-fg-subtle: #71717A    /* Tertiary text */

/* Accent Scale (Indigo) */
--kairo-color-accent-400: #818CF8
--kairo-color-accent-500: #6366F1   /* Primary accent */
--kairo-color-accent-600: #4F46E5
```

### 3.2 Semantic Tokens

```css
/* Lifecycle States */
--kairo-color-lifecycle-seed-fg:      #34D399  /* Emerald */
--kairo-color-lifecycle-rising-fg:    #FB923C  /* Orange */
--kairo-color-lifecycle-peaking-fg:   #F87171  /* Red */
--kairo-color-lifecycle-declining-fg: #A1A1AA  /* Zinc */
--kairo-color-lifecycle-evergreen-fg: var(--kairo-color-accent-400)
--kairo-color-lifecycle-active-fg:    #60A5FA  /* Blue */

/* Score Colors */
--kairo-color-score-high-fg:   #34D399  /* ≥80 */
--kairo-color-score-medium-fg: var(--kairo-color-accent-400)  /* ≥70 */
--kairo-color-score-low-fg:    var(--kairo-color-fg-muted)    /* <70 */

/* Platform Colors */
TikTok:    white on black
X:         white on black
Instagram: gradient (833AB4 → E1306C → F77737)
LinkedIn:  #0A66C2
Reddit:    #FF4500
Web:       muted text color
```

### 3.3 Typography

```css
--kairo-font-family-sans: Lato, system-ui, sans-serif

/* Sizes */
--kairo-font-size-xs:  11px
--kairo-font-size-sm:  13px
--kairo-font-size-md:  15px
--kairo-font-size-lg:  18px
--kairo-font-size-xl:  22px
--kairo-font-size-2xl: 28px

/* Weights */
--kairo-font-weight-regular:  400
--kairo-font-weight-medium:   500
--kairo-font-weight-semibold: 600
```

### 3.4 Spacing & Radii

```css
--kairo-radius-xs:   4px
--kairo-radius-sm:   6px
--kairo-radius-md:   10px
--kairo-radius-lg:   16px
--kairo-radius-pill: 999px
```

### 3.5 Motion

```css
--kairo-transition-fast:   100ms ease-out
--kairo-transition-normal: 150ms ease-out
--kairo-transition-slow:   250ms ease-out

--kairo-motion-fast:   120ms
--kairo-motion-medium: 200ms
--kairo-motion-slow:   280ms
```

### 3.6 Tailwind Usage

All tokens are available as Tailwind classes:
- `bg-kairo-bg-app`, `bg-kairo-bg-card`, `bg-kairo-bg-elevated`
- `text-kairo-fg`, `text-kairo-fg-muted`, `text-kairo-fg-subtle`
- `border-kairo-border-subtle`, `border-kairo-border-strong`
- `bg-kairo-accent-500`, `text-kairo-accent-400`
- `bg-kairo-lifecycle-rising-bg`, `text-kairo-lifecycle-rising-fg`

**Legacy tokens (deprecated but mapped):**
- `kairo-ink-*` → maps to `kairo-fg-*`
- `kairo-sand-*` → maps to `kairo-bg-*`
- `kairo-aqua-*` → maps to `kairo-accent-*`

---

## 4. Data Models (Zod Contracts)

All types are defined in `src/contracts/index.ts` with Zod schemas. Types are inferred from schemas.

### 4.1 Brand

```typescript
interface Brand {
  id: string;
  slug: string;
  name: string;
  vertical: string;
  voice_traits: string[];
  pillars: string[];
  personas: string[];
  guardrails: {
    do: string[];
    dont: string[];
  };
  format_playbook: Array<{
    format: FormatTaxonomy;
    why_it_works: string;
    examples: string[];
  }>;
}
```

### 4.2 Evidence Item

```typescript
type EvidencePlatform = "tiktok" | "instagram" | "x" | "linkedin" | "reddit" | "web";
type EvidenceContentType = "video" | "image" | "text" | "link";
type EvidenceFormat = "short_video" | "meme" | "thread" | "carousel" | "post";

interface EvidenceItem {
  id: string;
  platform: EvidencePlatform;
  content_type: EvidenceContentType;
  format?: EvidenceFormat;
  canonical_url: string;
  thumbnail_url: string | null;
  author_handle: string | null;
  created_at: string;       // ISO 8601
  captured_at?: string;     // When Kairo captured it
  caption?: string;
  metrics: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
  cluster_keys: Array<{
    type: "audio_id" | "hashtag" | "phrase" | "entity";
    value: string;
    role: "primary" | "secondary";
  }>;
  extracted?: {
    entities?: string[];
    hashtags?: string[];
    audio_title?: string;
  };
}
```

### 4.3 Opportunity

```typescript
type OpportunityType = "trend" | "evergreen" | "competitive";
type OpportunityStatus = "new" | "saved" | "packaged" | "dismissed";
type OpportunityLifecycle = "seed" | "rising" | "peaking" | "declining" | "evergreen" | "active";

interface Opportunity {
  id: string;
  type: OpportunityType;
  score: number;            // 0-100
  title: string;
  hook: string;
  why_now: string[];
  why_now_summary?: string;
  lifecycle?: OpportunityLifecycle;
  trend_kernel?: {
    kind: "audio" | "hashtag" | "phrase";
    value: string;
  };
  platforms?: EvidencePlatform[];
  format_target: FormatTaxonomy[];
  brand_fit: {
    persona: string;
    pillar: string;
    voice_reason: string;
  };
  evidence_ids: string[];
  signals: {
    velocity_label: string;
    lifecycle: string;
    confidence: string;
  };
  status: OpportunityStatus;
}

// Hydrated version with full evidence objects
interface OpportunityWithEvidence extends Opportunity {
  evidence: EvidenceItem[];
}
```

### 4.4 Content Package

```typescript
type FormatTaxonomy = "shortform_video" | "meme_static" | "carousel" | "thread" | "comment_stunt" | "founder_voice_post";
type PackageChannel = "x" | "linkedin" | "instagram" | "tiktok";
type VariantStatus = "draft" | "edited" | "approved";
type QualityBand = "good" | "partial" | "needs_work";

interface Variant {
  id: string;
  channel: PackageChannel;
  status: VariantStatus;
  body: string;
  notes?: string;
  score?: number;
}

interface ContentPackage {
  id: string;
  opportunity_id: string | null;
  title: string;
  thesis: string;
  outline_beats: string[];
  cta: string;
  format: FormatTaxonomy;
  deliverables: Array<{
    channel: PackageChannel;
    variant_id: string;
    label: string;
  }>;
  variants: Variant[];
  evidence_refs: string[];
  quality: {
    score: number;
    band: QualityBand;
    issues: string[];
  };
}
```

### 4.5 Pattern

```typescript
type PatternStatus = "active" | "experimental" | "deprecated";
type PatternCategory = "evergreen" | "launch" | "education" | "engagement";

interface Pattern {
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
```

---

## 5. Mock API

Located in `src/lib/mockApi/`. Returns fixture data validated by Zod.

### 5.1 Available Methods

```typescript
const mockApi = {
  // Brands
  listBrands(): Brand[],
  getBrand(brandId: string): Brand,

  // Opportunities
  listOpportunities(brandId: string): Opportunity[],
  getOpportunity(brandId: string, oppId: string): OpportunityWithEvidence,

  // Packages
  listPackages(brandId: string): ContentPackage[],
  getPackage(brandId: string, pkgId: string): ContentPackageWithEvidence,
  getOpportunityTitle(oppId: string): string | null,

  // Patterns
  listPatterns(): Pattern[],
  getPattern(patternId: string): Pattern,
  listPatternsByCategory(category: PatternCategory): Pattern[],
  listPatternsByChannel(channel: string): Pattern[],
  getTopPatterns(limit?: number): Pattern[],

  // Evidence
  getEvidence(evidenceId: string): EvidenceItem,

  // Write operations (log to console, no persistence)
  pinOpportunity(brandId: string, oppId: string): void,
  snoozeOpportunity(brandId: string, oppId: string): void,
  createPackage(brandId: string, oppId: string): string,
  updateVariant(brandId: string, pkgId: string, varId: string, updates: object): void,
};
```

### 5.2 Current Brand

Only Wendy's data exists: `DEFAULT_BRAND_ID = "brand_wendys"`

---

## 6. Page Routes

| Route | Purpose | Key Components |
|-------|---------|----------------|
| `/` | Redirect to default brand's today page | — |
| `/brands/[brandId]/today` | Daily dashboard with opportunities | `TodayBoardClient`, `OpportunityCardV2`, `OpportunityDrawer`, `TodayFocusStrip` |
| `/brands/[brandId]/packages` | Content pipeline table | `PackagesTable`, `PackageRow` |
| `/brands/[brandId]/packages/[packageId]` | Package editor | `PackageSummaryCard`, `ChannelVariantsPanel`, `BrandBrainPanel` |
| `/brands/[brandId]/patterns` | Pattern library | `PatternFilters`, `PatternRecommendationHero`, `PatternRow` |
| `/brands/[brandId]/strategy` | Brand strategy view | `BrandPositioningCard`, `PersonasGrid`, `PillarsRow`, `TaboosCard` |

---

## 7. Key Components

### 7.1 Layout

| Component | Purpose |
|-----------|---------|
| `AppShell` | Main layout with sidebar (240px desktop, drawer on mobile), top bar (48px), chat drawer |
| `TopBar` | Fixed header with brand context, "Ask Kairo" button, mobile menu toggle |
| `BrandSidebar` | Navigation: brands list + section nav (Today, Content, Patterns, Strategy) |

### 7.2 UI Primitives

| Component | Purpose |
|-----------|---------|
| `KButton` | Button with variants: primary, secondary, ghost; sizes: sm, md |
| `KCard` | Card container with variants: elevated (shadow) or bordered |
| `KTag` | Badge/tag with variants: default, filled, trend, evergreen, competitive, campaign, danger |

### 7.3 Opportunities

| Component | Purpose |
|-----------|---------|
| `OpportunityCardV2` | Card showing score, type, lifecycle, title, platforms with counts |
| `OpportunityDrawer` | Desktop: 560px right sheet. Mobile: bottom sheet with snap points (35%/55%/92%) |
| `EvidenceList` | Filterable evidence list with platform badges |
| `EvidenceTileExpanded` | Expandable tile with full caption, metrics, "open source" link |
| `PlatformBadgesRow` | Platform filter badges with counts |
| `PlatformIcon` | SVG icons for each platform |
| `Sparkline`, `LifecycleSparkline` | Mini trend visualization |

### 7.4 Packages

| Component | Purpose |
|-----------|---------|
| `PackagesTable` | Table with filter tabs (All, Good, In Progress, Needs Work) |
| `PackageRow` | Row showing title, channels, quality status |
| `PackageSummaryCard` | Package overview sidebar |
| `ChannelVariantsPanel` | Variant editor workspace |
| `BrandBrainPanel` | Brand guidelines + pattern suggestions |

### 7.5 Patterns

| Component | Purpose |
|-----------|---------|
| `PatternFilters` | Search + category/channel filter |
| `PatternRecommendationHero` | Featured "top pattern" card |
| `AlsoWorthTrying` | Secondary pattern suggestions |
| `PatternRow` | Single pattern in list |

---

## 8. URL State Patterns

### 8.1 Opportunity Drawer

The drawer state syncs to URL via query parameter:

```
?opp=<opportunity_id>
```

- **Open drawer**: Sets `?opp=opp_001`
- **Close drawer**: Removes `?opp=` param
- **Page load with param**: Opens drawer to that opportunity
- **Platform badge click**: Opens drawer with platform filter pre-set

Implementation uses `useRouter` and `useSearchParams` from Next.js with `router.replace()` to avoid history pollution.

---

## 9. Animation Patterns

Uses Framer Motion for:
- Drawer slide-in animations
- Mobile bottom sheet drag gestures
- Card hover effects (`whileHover`, `whileTap`)
- Expand/collapse transitions (`AnimatePresence`)

Spring configs typically use `damping: 30, stiffness: 300`.

---

## 10. Accessibility

- **Focus trap** in modals/drawers
- **Escape key** closes overlays
- **ARIA attributes**: `role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-pressed`, `aria-expanded`
- **Visible focus states**: `focus-visible:ring-2 focus-visible:ring-kairo-accent-500`
- **Body scroll lock** when overlays are open

---

## 11. Testing

**Framework:** Vitest 3.x

**Test Files:**
- `src/components/layout/__tests__/shellResponsiveness.test.ts` - Layout and dark theme tests
- `src/components/opportunities/__tests__/opportunityDrawer.test.ts` - Drawer behavior, URL state, accessibility
- `src/lib/mockApi/__tests__/mockApi.test.ts` - API method tests

**Commands:**
```bash
npm test          # Run once
npm run test:watch # Watch mode
```

---

## 12. Development Commands

```bash
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
npm test          # Run tests
```

---

## 13. Important Conventions

1. **Token-pure styling**: Never use hardcoded hex colors. Always use `kairo-*` tokens.
2. **Legacy token mapping**: `ink-*`, `sand-*`, `aqua-*` are deprecated but still work (mapped to semantic tokens).
3. **Component organization**: Each feature domain has its own directory with `index.ts` barrel export.
4. **Server/Client split**: Pages are async server components; interactive parts use `"use client"` components.
5. **Data validation**: All API responses validated with Zod before use.
6. **Test IDs**: Use `data-testid` attributes for testing hooks.

---

## 14. Current Fixture Data (Wendy's)

**Brand Voice:**
- Snarky, playful roast, fast timing, confident, punchy

**Pillars:**
- Freshness flex
- Competitor roast
- Menu innovation
- Fan banter
- Culture hijack (safe)

**Personas:**
- Social manager
- Brand lead
- Agency creative

**Guardrails:**
- Do: roast like a human, keep it short, win the comments, anchor to food truth
- Don't: politics, punch down, sensitive tragedies, fake claims

**Sample Opportunities:**
- Trend opportunities (rising/peaking audio trends)
- Competitive opportunities (roast competitor announcements)
- Evergreen opportunities (freshness carousels, threads)

**Evidence Sources:**
- TikTok videos with metrics
- Instagram reels/memes
- X posts
- Web articles

---

## 15. File Quick Reference

| Need | File |
|------|------|
| Design tokens | `src/app/globals.css` |
| Type definitions | `src/contracts/index.ts` |
| Mock data | `src/fixtures/wendysPack.ts` |
| API methods | `src/lib/mockApi/client.ts` |
| Main layout | `src/components/layout/AppShell.tsx` |
| Opportunity drawer | `src/components/opportunities/OpportunityDrawer.tsx` |
| Today page | `src/app/brands/[brandId]/today/page.tsx` + `TodayBoardClient.tsx` |

---

*Last updated: PR-C (Opportunity Drawer Evidence Workspace)*
