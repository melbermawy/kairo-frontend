# Kairo Frontend Audit

**Date:** 2024-12-16
**Scope:** Frontend repository only (`ui/`)
**Purpose:** Inventory of routes, components, styling, data layer, and domain types

---

## 1. Route + Page Inventory

### App Router Structure

| Route | Page File | Description |
|-------|-----------|-------------|
| `/` | `src/app/page.tsx` | Redirects to `/brands/{DEFAULT_BRAND_ID}/today` |
| `/brands/[brandId]/today` | `src/app/brands/[brandId]/today/page.tsx` | Today dashboard - opportunities board |
| `/brands/[brandId]/packages` | `src/app/brands/[brandId]/packages/page.tsx` | Content packages list |
| `/brands/[brandId]/packages/[packageId]` | `src/app/brands/[brandId]/packages/[packageId]/page.tsx` | Package detail/editor |
| `/brands/[brandId]/patterns` | `src/app/brands/[brandId]/patterns/page.tsx` | Pattern library |
| `/brands/[brandId]/strategy` | `src/app/brands/[brandId]/strategy/page.tsx` | Brand strategy (voice, personas, pillars) |

### Layouts

| Layout File | Scope |
|-------------|-------|
| `src/app/layout.tsx` | Root layout (fonts, globals) |
| `src/app/brands/[brandId]/layout.tsx` | Brand-scoped layout (wraps AppShell) |

### Auth Routes
**None found.** No authentication routes exist.

### Onboarding Routes
**None found.** No onboarding flow exists.

### Hero Pages
- **Today (TodayBoard):** `src/app/brands/[brandId]/today/page.tsx`
- **Package Editor:** `src/app/brands/[brandId]/packages/[packageId]/page.tsx`

---

## 2. Component + Layout Primitives

### Page Shell Components

| Component | File Path | Purpose |
|-----------|-----------|---------|
| `AppShell` | `src/components/layout/AppShell.tsx` | Main layout wrapper (sidebar + topbar + content area) |
| `BrandSidebar` | `src/components/layout/BrandSidebar.tsx` | Left sidebar - brand selector + section nav |
| `TopBar` | `src/components/layout/TopBar.tsx` | Fixed header with brand context + Ask Kairo button |
| `ChatDrawer` | `src/components/chat/ChatDrawer.tsx` | Sliding drawer for Kairo AI chat |
| `KairoChatChrome` | `src/components/chat/KairoChatChrome.tsx` | Chat state management wrapper |

### UI Primitives

| Component | File Path | Purpose |
|-----------|-----------|---------|
| `KButton` | `src/components/ui/KButton.tsx` | Button (primary/secondary/ghost, sm/md) |
| `KCard` | `src/components/ui/KCard.tsx` | Card container (elevated or bordered) |
| `KTag` | `src/components/ui/KTag.tsx` | Tag/pill (semantic variants: trend, evergreen, competitive, campaign) |

### Feature Components by Domain

**Opportunities:**
| Component | File Path |
|-----------|-----------|
| `OpportunityCard` | `src/components/opportunities/OpportunityCard.tsx` |

**Packages:**
| Component | File Path |
|-----------|-----------|
| `PackagesTable` | `src/components/packages/PackagesTable.tsx` |
| `PackageRow` | `src/components/packages/PackageRow.tsx` |
| `PackageSummaryCard` | `src/components/packages/PackageSummaryCard.tsx` |
| `ChannelVariantsPanel` | `src/components/packages/ChannelVariantsPanel.tsx` |
| `BrandBrainPanel` | `src/components/packages/BrandBrainPanel.tsx` |
| `SourceOpportunityCard` | `src/components/packages/SourceOpportunityCard.tsx` |

**Patterns:**
| Component | File Path |
|-----------|-----------|
| `PatternFilters` | `src/components/patterns/PatternFilters.tsx` |
| `PatternRow` | `src/components/patterns/PatternRow.tsx` |
| `PatternRecommendationHero` | `src/components/patterns/PatternRecommendationHero.tsx` |
| `AlsoWorthTrying` | `src/components/patterns/AlsoWorthTrying.tsx` |

**Strategy:**
| Component | File Path |
|-----------|-----------|
| `BrandPositioningCard` | `src/components/strategy/BrandPositioningCard.tsx` |
| `PersonasGrid` | `src/components/strategy/PersonasGrid.tsx` |
| `PillarsRow` | `src/components/strategy/PillarsRow.tsx` |
| `TaboosCard` | `src/components/strategy/TaboosCard.tsx` |

**Today:**
| Component | File Path |
|-----------|-----------|
| `TodayFocusStrip` | `src/components/today/TodayFocusStrip.tsx` |

**Content:**
| Component | File Path |
|-----------|-----------|
| `ContentPipelineStrip` | `src/components/content/ContentPipelineStrip.tsx` |

### Styling System

| Aspect | Implementation |
|--------|----------------|
| **Framework** | Tailwind CSS v4 |
| **Config** | CSS-based (`@theme inline` in `globals.css`) - no `tailwind.config.js` |
| **Design Tokens** | Custom CSS variables in `:root` (`--kairo-color-*`, `--kairo-radius-*`, etc.) |
| **CSS Modules** | Not used |
| **Styled Components** | Not used |
| **Shadcn/UI** | Not used (custom `K*` components instead) |

### Animation & Chart Libraries

| Library | Version | Usage |
|---------|---------|-------|
| `framer-motion` | `^12.23.26` | Animations in PackagesTable, PatternFilters, TodayFocusStrip, etc. |
| Chart libraries | None | No charting library installed |

---

## 3. Responsiveness + Layout System

### Breakpoint Strategy

Tailwind v4 default breakpoints (defined in Tailwind core, not customized):
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

**Where defined:** Not explicitly customized; uses Tailwind defaults.

### Files Using Responsive Breakpoints

| File | Breakpoints Used |
|------|-----------------|
| `src/app/brands/[brandId]/today/page.tsx` | `lg:` |
| `src/app/brands/[brandId]/packages/[packageId]/page.tsx` | `lg:` |
| `src/components/today/TodayFocusStrip.tsx` | `sm:`, `lg:` |
| `src/components/strategy/PersonasGrid.tsx` | `md:`, `lg:` |
| `src/components/strategy/PillarsRow.tsx` | `md:` |
| `src/components/content/ContentPipelineStrip.tsx` | `sm:` |
| `src/components/packages/PackagesTable.tsx` | `md:` |
| `src/components/chat/ChatDrawer.tsx` | `lg:` |
| `src/components/ui/KButton.tsx` | None |

### Top 10 Responsive Issues

| # | File | Issue |
|---|------|-------|
| 1 | `src/components/layout/AppShell.tsx:31` | Fixed `ml-[240px]` for sidebar - breaks on mobile (no responsive hide) |
| 2 | `src/components/layout/BrandSidebar.tsx:35` | Fixed `w-[240px]` sidebar - no mobile collapse/drawer pattern |
| 3 | `src/components/layout/TopBar.tsx:26` | Fixed header but no mobile hamburger menu |
| 4 | `src/app/brands/[brandId]/today/page.tsx` | Only uses `lg:` breakpoint - no `sm:` or `md:` handling |
| 5 | `src/components/packages/PackageRow.tsx` | Complex two-column layout may overflow on narrow screens |
| 6 | `src/components/packages/PackagesTable.tsx:83` | Column header uses `hidden md:flex` but row content doesn't adapt |
| 7 | `src/components/patterns/PatternFilters.tsx` | Category filters may overflow horizontally on mobile |
| 8 | `src/app/brands/[brandId]/packages/[packageId]/page.tsx` | Three-column grid only adapts at `lg:`, nothing for tablet |
| 9 | `src/components/layout/AppShell.tsx:41` | Fixed `px-10 py-8` padding - too large for mobile |
| 10 | `src/components/chat/ChatDrawer.tsx` | Mobile bottom sheet at `h-[70vh]` may not account for keyboard |

---

## 4. Data + API Client

### How Frontend Calls Backend

**Current Implementation:** No real API calls. All data is served from in-memory demo fixtures.

| Aspect | Implementation |
|--------|----------------|
| **HTTP Client** | None (no fetch, axios, or similar) |
| **Data Fetching** | Synchronous imports from `src/demo/*.ts` |
| **State Management** | React `useState` only (no Redux, Zustand, Jotai) |
| **Server State** | No React Query, SWR, or tRPC |

### Data Access Pattern

Data flows through `demoClient` abstraction layer:

```
Page/Component
    ↓
demoClient (src/lib/demoClient.ts)
    ↓
Demo fixtures (src/demo/*.ts)
```

### Base URL / Env Config

| Item | Location | Status |
|------|----------|--------|
| Environment variables | None | No `NEXT_PUBLIC_*` or `process.env.*` usage found |
| API base URL | N/A | Not configured |
| Demo mode flag | `src/config/demoMode.ts` | `export const demoMode = true;` |

### Type Definitions Location

| Types | File Path |
|-------|-----------|
| Brand types | `src/demo/brands.ts` |
| Opportunity types | `src/demo/opportunities.ts` |
| Package types | `src/demo/packages.ts` |
| Pattern types | `src/demo/patterns.ts` |
| Re-exports | `src/lib/demoClient.ts` |

---

## 5. Current Domain Shapes

### DemoOpportunity (Opportunity / TodayBoard)

**File:** `src/demo/opportunities.ts:3-16`

```typescript
export type OpportunityType = "trend" | "evergreen" | "competitive" | "campaign";

export interface DemoOpportunity {
  id: string;
  brandId: string;
  type: OpportunityType;
  score: number;
  title: string;
  angle: string;
  persona: string;
  pillar: string;
  source: string;
  sourceType: "article" | "competitor" | "social" | "internal";
  isPinned?: boolean;
  isSnoozed?: boolean;
}
```

**Used in:**
- `src/app/brands/[brandId]/today/page.tsx`
- `src/components/opportunities/OpportunityCard.tsx`
- `src/components/packages/SourceOpportunityCard.tsx`
- `src/lib/demoClient.ts`

---

### DemoPackage (ContentPackage)

**File:** `src/demo/packages.ts:12-26`

```typescript
export type PackageStatus = "draft" | "in_review" | "scheduled" | "published";
export type PackageChannel = "linkedin" | "x" | "youtube_script";

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
  channels: PackageChannel[];
  variants: DemoVariant[];
  owner: string;
  lastUpdated: string;
}
```

**Used in:**
- `src/app/brands/[brandId]/packages/page.tsx`
- `src/app/brands/[brandId]/packages/[packageId]/page.tsx`
- `src/app/brands/[brandId]/today/page.tsx` (for metrics)
- `src/components/packages/PackageRow.tsx`
- `src/components/packages/PackagesTable.tsx`
- `src/components/packages/PackageSummaryCard.tsx`
- `src/lib/demoClient.ts`

---

### DemoVariant (Variant)

**File:** `src/demo/packages.ts:4-10`

```typescript
export interface DemoVariant {
  id: string;
  channel: "LinkedIn" | "X";
  body: string;
  pattern: string;
  status: "draft" | "edited" | "approved";
}
```

**Used in:**
- `src/demo/packages.ts` (embedded in DemoPackage)
- `src/components/packages/ChannelVariantsPanel.tsx`
- `src/app/brands/[brandId]/packages/[packageId]/page.tsx`

---

### DemoPattern

**File:** `src/demo/patterns.ts:4-18`

```typescript
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
```

**Used in:**
- `src/app/brands/[brandId]/patterns/page.tsx`
- `src/app/brands/[brandId]/packages/[packageId]/page.tsx`
- `src/components/patterns/PatternRow.tsx`
- `src/components/patterns/PatternFilters.tsx`
- `src/components/patterns/PatternRecommendationHero.tsx`
- `src/components/patterns/AlsoWorthTrying.tsx`
- `src/components/packages/BrandBrainPanel.tsx`
- `src/lib/demoClient.ts`

---

### DemoBrand + BrandStrategy

**File:** `src/demo/brands.ts:38-51` and `src/demo/brands.ts:31-36`

```typescript
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

export interface BrandStrategy {
  voice: BrandVoice;
  personas: BrandPersona[];
  pillars: BrandPillar[];
  guardrails: BrandGuardrails;
}
```

**Used in:**
- `src/app/brands/[brandId]/layout.tsx`
- `src/app/brands/[brandId]/strategy/page.tsx`
- `src/components/layout/BrandSidebar.tsx`
- `src/components/layout/TopBar.tsx`
- `src/components/layout/AppShell.tsx`
- `src/lib/demoClient.ts`

---

## 6. Obvious Risks

| Risk | Severity | Notes |
|------|----------|-------|
| **No mobile layout** | High | Sidebar is fixed 240px, no hamburger menu or responsive collapse |
| **No auth** | High | No authentication routes or session management |
| **Hardcoded demo data** | Medium | All data in-memory; no API integration pattern established |
| **No error boundaries** | Medium | No React error boundaries found in component tree |
| **No loading states** | Medium | Server components render synchronously from fixtures |
| **Channel type mismatch** | Low | `DemoVariant.channel` uses "LinkedIn"/"X" vs `PackageChannel` uses "linkedin"/"x" |
| **No TypeScript strict mode verification** | Low | Types defined but no zod/runtime validation |
| **Large bundle potential** | Low | framer-motion included but tree-shaking not verified |

---

## Appendix: Directory Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── brands/
│       └── [brandId]/
│           ├── layout.tsx
│           ├── today/page.tsx
│           ├── packages/
│           │   ├── page.tsx
│           │   └── [packageId]/page.tsx
│           ├── patterns/page.tsx
│           └── strategy/page.tsx
├── components/
│   ├── chat/
│   ├── content/
│   ├── layout/
│   ├── opportunities/
│   ├── packages/
│   ├── patterns/
│   ├── strategy/
│   ├── theme/
│   ├── today/
│   └── ui/
├── config/
│   └── demoMode.ts
├── demo/
│   ├── brands.ts
│   ├── opportunities.ts
│   ├── packages.ts
│   ├── patterns.ts
│   └── index.ts
└── lib/
    └── demoClient.ts
```
