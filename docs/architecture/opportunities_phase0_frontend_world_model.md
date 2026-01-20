# Opportunities Engine: Phase 0 Frontend World Model

**Audit Date:** 2026-01-15
**Auditor:** Claude Opus 4.5
**Scope:** Read-only codebase inspection of the Opportunities UI rendering system

---

## 1. Executive Summary

### What the UI Actually Renders

The frontend renders a "Today" page showing opportunity cards with evidence, all powered by **local mock data from fixtures**. There is **no backend integration** - the UI uses `mockApi` which reads from in-memory arrays populated from `wendysPack.ts` fixtures.

| Component | Status | Notes |
|-----------|--------|-------|
| **Today Page** | RENDERS | Fully functional with mock data |
| **Opportunity Cards** | RENDERS | Score badge, lifecycle, type, platform badges, trend kernel |
| **Opportunity Drawer** | RENDERS | Full detail view with evidence, brand fit, actions |
| **Evidence List** | RENDERS | Platform filtering, expandable tiles with metrics |
| **Week Metrics** | PLACEHOLDER | Hardcoded to "0 of N" - no real data |
| **Pin/Snooze** | STUB | Console.log only - no persistence |
| **Create Package** | WORKING | Creates in-memory, navigates to package page |

### What is Mock/Placeholder

| Component | Implementation | Evidence |
|-----------|----------------|----------|
| **Data Source** | 100% mock fixtures | [wendysPack.ts](ui/src/fixtures/wendysPack.ts) |
| **API Client** | In-memory reads only | [mockApi/client.ts:139-741](ui/src/lib/mockApi/client.ts#L139-L741) |
| **Backend Calls** | None | No real API imports in today page |
| **Metrics** | Static targets | "0 of 3", "0 of 4", "0 of 5" |
| **Actions (pin/snooze)** | Console.log stubs | [mockApi/client.ts:366-392](ui/src/lib/mockApi/client.ts#L366-L392) |

---

## 2. Routes & Pages

### Today Page Route

| Route | File | Type |
|-------|------|------|
| `/brands/[brandId]/today` | [page.tsx](ui/src/app/brands/[brandId]/today/page.tsx) | Server Component |
| Client component | [TodayBoardClient.tsx](ui/src/app/brands/[brandId]/today/TodayBoardClient.tsx) | Client Component |

### Server Component Data Flow

```typescript
// ui/src/app/brands/[brandId]/today/page.tsx:62-108

export default async function TodayPage({ params }: TodayPageProps) {
  const { brandId } = await params;

  // 1. Get brand (sync, mock)
  brand = mockApi.getBrand(brandId);              // :67

  // 2. Get opportunities (sync, mock)
  const opportunities = mockApi.listOpportunities(brandId);  // :75

  // 3. Get packages for metrics (sync, mock)
  const packages = mockApi.listPackages(brandId);  // :76

  // 4. Sort by score descending
  const sortedOpportunities = [...opportunities].sort((a, b) => b.score - a.score);  // :82

  // 5. Hydrate each opportunity with evidence
  const opportunitiesWithEvidence = sortedOpportunities.map((opp) =>
    mockApi.getOpportunity(brandId, opp.id)        // :92-94
  );

  // 6. Pass to client
  return <TodayBoardClient ... />                  // :96-107
}
```

**Critical: No real API calls** - all data comes from `mockApi` which is synchronous in-memory access.

---

## 3. Data Fetching

### Current Implementation: mockApi

| Method | Source | Notes |
|--------|--------|-------|
| `mockApi.getBrand(brandId)` | [client.ts:160-166](ui/src/lib/mockApi/client.ts#L160-L166) | In-memory lookup |
| `mockApi.listOpportunities(brandId)` | [client.ts:176-188](ui/src/lib/mockApi/client.ts#L176-L188) | Returns all opportunities |
| `mockApi.getOpportunity(brandId, oppId)` | [client.ts:194-218](ui/src/lib/mockApi/client.ts#L194-L218) | Hydrates evidence_ids |
| `mockApi.listPackages(brandId)` | [client.ts:228-240](ui/src/lib/mockApi/client.ts#L228-L240) | For metrics computation |

### Polling/Caching: None

- **No polling** - data is fetched once on page load (server render)
- **No caching** - Next.js SSR with no revalidation strategy
- **No SWR/React Query** - no client-side data fetching library

### State Management

| State | Location | Mechanism |
|-------|----------|-----------|
| Selected opportunity | [TodayBoardClient.tsx:45](ui/src/app/brands/[brandId]/today/TodayBoardClient.tsx#L45) | `useState<OpportunityWithEvidence | null>` |
| Drawer open state | [TodayBoardClient.tsx:46](ui/src/app/brands/[brandId]/today/TodayBoardClient.tsx#L46) | `useState<boolean>` |
| Platform filter | [TodayBoardClient.tsx:47](ui/src/app/brands/[brandId]/today/TodayBoardClient.tsx#L47) | `useState<EvidencePlatform | null>` |
| URL sync | [TodayBoardClient.tsx:62-74](ui/src/app/brands/[brandId]/today/TodayBoardClient.tsx#L62-L74) | `router.replace()` with `?opp=<id>` |

### Error Handling

| Scenario | Handling | Location |
|----------|----------|----------|
| Brand not found | Returns `null` (blank page) | [page.tsx:66-73](ui/src/app/brands/[brandId]/today/page.tsx#L66-L73) |
| Opportunity not found | `NotFoundError` thrown | [client.ts:199-201](ui/src/lib/mockApi/client.ts#L199-L201) |
| Evidence not found | Silently filtered out | [client.ts:204-206](ui/src/lib/mockApi/client.ts#L204-L206) |

---

## 4. Components

### Opportunity Card (`OpportunityCardV2`)

**Location:** [components/opportunities/OpportunityCardV2.tsx](ui/src/components/opportunities/OpportunityCardV2.tsx)

| Element | Source Field | Line |
|---------|--------------|------|
| Score badge | `opportunity.score` | [:117-130](ui/src/components/opportunities/OpportunityCardV2.tsx#L117-L130) |
| Type tag | `opportunity.type` | [:133-135](ui/src/components/opportunities/OpportunityCardV2.tsx#L133-L135) |
| Lifecycle badge | `opportunity.lifecycle` | [:138-146](ui/src/components/opportunities/OpportunityCardV2.tsx#L138-L146) |
| Title | `opportunity.title` | [:150-152](ui/src/components/opportunities/OpportunityCardV2.tsx#L150-L152) |
| Why now summary | `opportunity.why_now_summary` | [:155-159](ui/src/components/opportunities/OpportunityCardV2.tsx#L155-L159) |
| Platform badges | `opportunity.platforms` + `opportunity.evidence` | [:164-194](ui/src/components/opportunities/OpportunityCardV2.tsx#L164-L194) |
| Trend kernel chip | `opportunity.trend_kernel.kind`, `.value` | [:197-206](ui/src/components/opportunities/OpportunityCardV2.tsx#L197-L206) |
| Pillar chip | `opportunity.brand_fit.pillar` | [:209-211](ui/src/components/opportunities/OpportunityCardV2.tsx#L209-L211) |

**Props Shape:**
```typescript
// :10-15
interface OpportunityCardV2Props {
  opportunity: Opportunity | OpportunityWithEvidence;
  onClick?: () => void;
  onPlatformClick?: (platform: EvidencePlatform) => void;
  isSelected?: boolean;
}
```

### Opportunity Drawer (`OpportunityDrawer`)

**Location:** [components/opportunities/OpportunityDrawer.tsx](ui/src/components/opportunities/OpportunityDrawer.tsx)

| Section | Source Fields | Lines |
|---------|---------------|-------|
| Header (score, type, lifecycle) | `opportunity.score`, `.type`, `.lifecycle` | [:196-224](ui/src/components/opportunities/OpportunityDrawer.tsx#L196-L224) |
| Title | `opportunity.title` | [:227-232](ui/src/components/opportunities/OpportunityDrawer.tsx#L227-L232) |
| Why Now section | `opportunity.why_now_summary`, `.why_now[]` | [:268-288](ui/src/components/opportunities/OpportunityDrawer.tsx#L268-L288) |
| Trend Signal | `opportunity.trend_kernel.kind`, `.value` | [:291-316](ui/src/components/opportunities/OpportunityDrawer.tsx#L291-L316) |
| Brand Fit | `opportunity.brand_fit.pillar`, `.persona`, `.voice_reason` | [:319-335](ui/src/components/opportunities/OpportunityDrawer.tsx#L319-L335) |
| Evidence List | `opportunity.evidence[]` | [:337-347](ui/src/components/opportunities/OpportunityDrawer.tsx#L337-L347) |
| Build Concept CTA | Links to `/brands/{id}/content/concepts/new?opportunityId={oppId}` | [:354-374](ui/src/components/opportunities/OpportunityDrawer.tsx#L354-L374) |
| Create Package CTA | Navigates to `/brands/{id}/packages/new-from-opp-{oppId}` | [:377-410](ui/src/components/opportunities/OpportunityDrawer.tsx#L377-L410) |

**Props Shape:**
```typescript
// :16-22
interface OpportunityDrawerProps {
  opportunity: OpportunityWithEvidence | null;
  isOpen: boolean;
  onClose: () => void;
  brandId: string;
  initialPlatformFilter?: EvidencePlatform | null;
}
```

### Evidence Components

| Component | File | Purpose |
|-----------|------|---------|
| `EvidenceList` | [EvidenceList.tsx](ui/src/components/opportunities/EvidenceList.tsx) | Platform filter + tile container |
| `EvidenceTileExpanded` | [EvidenceTileExpanded.tsx](ui/src/components/opportunities/EvidenceTileExpanded.tsx) | Expandable evidence tile |
| `PlatformBadgesRow` | [PlatformBadgesRow.tsx](ui/src/components/opportunities/PlatformBadgesRow.tsx) | Platform filter badges |
| `PlatformIcon` | [PlatformIcon.tsx](ui/src/components/opportunities/PlatformIcon.tsx) | Platform icon + badge |
| `LifecycleSparkline` | [Sparkline.tsx](ui/src/components/opportunities/Sparkline.tsx) | Lifecycle visual indicator |

---

## 5. Assumed DTO Shape (Frontend Expectations)

### Opportunity (from frontend contracts)

```typescript
// ui/src/contracts/index.ts:171-187

interface Opportunity {
  id: string;                                    // REQUIRED
  type: "trend" | "evergreen" | "competitive";   // REQUIRED
  score: number;                                 // REQUIRED: 0-100
  title: string;                                 // REQUIRED
  hook: string;                                  // REQUIRED
  why_now: string[];                             // REQUIRED
  why_now_summary?: string;                      // OPTIONAL: card display
  lifecycle?: "seed" | "rising" | "peaking" | "declining" | "evergreen" | "active";  // OPTIONAL
  trend_kernel?: { kind: "audio" | "hashtag" | "phrase"; value: string };  // OPTIONAL
  platforms?: ("tiktok" | "instagram" | "x" | "linkedin" | "reddit" | "web")[];  // OPTIONAL
  format_target: ("shortform_video" | "meme_static" | "carousel" | "thread" | "comment_stunt" | "founder_voice_post")[];  // REQUIRED
  brand_fit: {                                   // REQUIRED
    persona: string;
    pillar: string;
    voice_reason: string;
  };
  evidence_ids: string[];                        // REQUIRED (but may be empty)
  signals: {                                     // REQUIRED
    velocity_label: string;
    lifecycle: string;
    confidence: string;
  };
  status: "new" | "saved" | "packaged" | "dismissed";  // REQUIRED
}
```

### OpportunityWithEvidence (hydrated)

```typescript
// ui/src/contracts/index.ts:194-196

interface OpportunityWithEvidence extends Opportunity {
  evidence: EvidenceItem[];  // Hydrated from evidence_ids
}
```

### EvidenceItem

```typescript
// ui/src/contracts/index.ts:81-95

interface EvidenceItem {
  id: string;                                    // REQUIRED
  platform: "tiktok" | "instagram" | "x" | "linkedin" | "reddit" | "web";  // REQUIRED
  content_type: "video" | "image" | "text" | "link";  // REQUIRED
  format?: "short_video" | "meme" | "thread" | "carousel" | "post";  // OPTIONAL
  canonical_url: string;                         // REQUIRED: valid URL
  thumbnail_url?: string | null;                 // OPTIONAL
  author_handle?: string | null;                 // OPTIONAL
  created_at: string;                            // REQUIRED: ISO 8601
  captured_at?: string;                          // OPTIONAL: ISO 8601
  caption?: string;                              // OPTIONAL
  metrics: {                                     // REQUIRED (but fields optional)
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
  cluster_keys: {                                // REQUIRED (but may be empty)
    type: "audio_id" | "hashtag" | "phrase" | "entity";
    value: string;
    role: "primary" | "secondary";
  }[];
  extracted?: {                                  // OPTIONAL
    entities?: string[];
    hashtags?: string[];
    audio_title?: string;
  };
}
```

---

## 6. Contract Drift (Frontend vs Backend Mismatch)

### Fields Frontend Expects But Backend Doesn't Send

| Field | Frontend Location | Backend Status |
|-------|-------------------|----------------|
| `hook` | [OpportunitySchema:176](ui/src/contracts/index.ts#L176) | **MISSING** - Backend has `angle` instead |
| `why_now` (array) | [OpportunitySchema:177](ui/src/contracts/index.ts#L177) | **MISSING** - Backend has `why_now` as single string in draft |
| `why_now_summary` | [OpportunitySchema:178](ui/src/contracts/index.ts#L178) | **MISSING** - Backend doesn't have |
| `lifecycle` | [OpportunitySchema:179](ui/src/contracts/index.ts#L179) | **MISSING** - Backend doesn't have |
| `trend_kernel` | [OpportunitySchema:180](ui/src/contracts/index.ts#L180) | **MISSING** - Backend doesn't have |
| `platforms` (array) | [OpportunitySchema:181](ui/src/contracts/index.ts#L181) | **DIFFERENT** - Backend has `primary_channel` + `suggested_channels` |
| `format_target` | [OpportunitySchema:182](ui/src/contracts/index.ts#L182) | **MISSING** - Backend doesn't have |
| `brand_fit.persona` | [BrandFitSchema:160](ui/src/contracts/index.ts#L160) | **DIFFERENT** - Backend has `persona_id` (UUID) |
| `brand_fit.pillar` | [BrandFitSchema:161](ui/src/contracts/index.ts#L161) | **DIFFERENT** - Backend has `pillar_id` (UUID) |
| `brand_fit.voice_reason` | [BrandFitSchema:162](ui/src/contracts/index.ts#L162) | **MISSING** - Backend doesn't have |
| `evidence_ids` | [OpportunitySchema:184](ui/src/contracts/index.ts#L184) | **MISSING** - Backend doesn't track evidence |
| `signals` | [OpportunitySignalsSchema:165-169](ui/src/contracts/index.ts#L165-L169) | **MISSING** - Backend doesn't have |
| `status` | [OpportunityStatusSchema:136-141](ui/src/contracts/index.ts#L136-L141) | **DIFFERENT** - Backend has `is_pinned`, `is_snoozed` booleans |

### Fields Backend Sends But Frontend Doesn't Use

| Field | Backend DTO | Frontend Usage |
|-------|-------------|----------------|
| `brand_id` | `OpportunityDTO.brand_id` | Not rendered |
| `angle` | `OpportunityDTO.angle` | Frontend expects `hook` |
| `score_explanation` | `OpportunityDTO.score_explanation` | Not rendered |
| `source` | `OpportunityDTO.source` | Not rendered |
| `source_url` | `OpportunityDTO.source_url` | Not rendered |
| `persona_id` | `OpportunityDTO.persona_id` | Frontend expects `brand_fit.persona` (name) |
| `pillar_id` | `OpportunityDTO.pillar_id` | Frontend expects `brand_fit.pillar` (name) |
| `primary_channel` | `OpportunityDTO.primary_channel` | Frontend expects `platforms[]` |
| `suggested_channels` | `OpportunityDTO.suggested_channels` | Not used |
| `snoozed_until` | `OpportunityDTO.snoozed_until` | Not rendered |
| `created_via` | `OpportunityDTO.created_via` | Not rendered |
| `created_at` | `OpportunityDTO.created_at` | Not rendered |
| `updated_at` | `OpportunityDTO.updated_at` | Not rendered |

### Type Enum Mismatch

| Category | Frontend Values | Backend Values |
|----------|-----------------|----------------|
| `OpportunityType` | `trend`, `evergreen`, `competitive` | `trend`, `evergreen`, `competitive`, `campaign` |
| `OpportunityStatus` | `new`, `saved`, `packaged`, `dismissed` | *(uses `is_pinned`, `is_snoozed` booleans instead)* |
| `Channel` | `tiktok`, `instagram`, `x`, `linkedin`, `reddit`, `web` | `linkedin`, `x`, `youtube`, `instagram`, `tiktok`, `newsletter` |

### Evidence: Frontend Has It, Backend Doesn't

The frontend expects opportunities to have `evidence_ids: string[]` and hydrates them into `evidence: EvidenceItem[]`. The backend **does not track evidence at all** - this is entirely a frontend concept from the mock fixtures.

---

## 7. Performance Hazards

### Heavy Renders

| Issue | Location | Risk |
|-------|----------|------|
| N+1 evidence hydration | [page.tsx:92-94](ui/src/app/brands/[brandId]/today/page.tsx#L92-L94) | **HIGH** - loops through all opportunities, calling `getOpportunity` for each |
| Framer Motion animations | [OpportunityCardV2.tsx](ui/src/components/opportunities/OpportunityCardV2.tsx), [OpportunityDrawer.tsx](ui/src/components/opportunities/OpportunityDrawer.tsx) | **LOW** - expected overhead |
| `useMemo` for platformCounts | [OpportunityCardV2.tsx:64-77](ui/src/components/opportunities/OpportunityCardV2.tsx#L64-L77) | **LOW** - per-card, acceptable |

### Infinite Loop Risks

| Area | Status | Notes |
|------|--------|-------|
| URL sync with drawer | **SAFE** | Uses `router.replace` with `scroll: false` |
| Platform filter state | **SAFE** | Controlled state with `useCallback` |
| Effect dependencies | **SAFE** | Proper dependency arrays |

### Polling Storms

| Area | Status | Notes |
|------|--------|-------|
| Today page | **NONE** | No polling - single SSR fetch |
| Drawer content | **NONE** | Data pre-loaded from parent |

### Markdown/Rendering Cost

| Area | Location | Impact |
|------|----------|--------|
| `line-clamp-2` on title | [OpportunityCardV2.tsx:150](ui/src/components/opportunities/OpportunityCardV2.tsx#L150) | Low |
| Evidence caption truncation | [EvidenceTileExpanded.tsx:105](ui/src/components/opportunities/EvidenceTileExpanded.tsx#L105) | Low |
| AnimatePresence for drawer | [OpportunityDrawer.tsx:420-488](ui/src/components/opportunities/OpportunityDrawer.tsx#L420-L488) | Medium - re-renders on open/close |

### Memory Issues

| Issue | Location | Risk |
|-------|----------|------|
| In-memory package creation | [client.ts:452](ui/src/lib/mockApi/client.ts#L452) | **LOW** - mock only |
| Evidence array copies | [client.ts:204-206](ui/src/lib/mockApi/client.ts#L204-L206) | **LOW** - small arrays |

---

## 8. Minimal "CURRENT DTO" (What UI Actually Needs)

### Opportunity (Minimum to Render Card)

```typescript
interface OpportunityMinimal {
  id: string;
  type: "trend" | "evergreen" | "competitive";
  score: number;                    // 0-100
  title: string;
  why_now_summary?: string;         // Optional but helpful for card
  lifecycle?: string;               // For badge
  trend_kernel?: {                  // For chip
    kind: string;
    value: string;
  };
  platforms?: string[];             // For platform badges
  brand_fit: {
    pillar: string;                 // For pillar chip
    persona: string;                // For drawer
    voice_reason: string;           // For drawer
  };
}
```

### Opportunity (Full Detail for Drawer)

```typescript
interface OpportunityFull extends OpportunityMinimal {
  hook: string;                     // Not used but in schema
  why_now: string[];                // Bullet points in drawer
  format_target: string[];          // Not rendered but in schema
  evidence_ids: string[];           // For hydration
  signals: {                        // Not rendered
    velocity_label: string;
    lifecycle: string;
    confidence: string;
  };
  status: string;                   // Not rendered
}
```

### OpportunityWithEvidence (Hydrated for Drawer)

```typescript
interface OpportunityWithEvidence extends OpportunityFull {
  evidence: EvidenceItem[];         // Hydrated evidence
}
```

### EvidenceItem (Minimum to Render Tile)

```typescript
interface EvidenceItemMinimal {
  id: string;
  platform: string;
  content_type: string;
  canonical_url: string;
  thumbnail_url?: string | null;
  author_handle?: string | null;
  created_at: string;
  captured_at?: string;
  caption?: string;
  metrics: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
  format?: string;
  extracted?: {
    hashtags?: string[];
    audio_title?: string;
  };
}
```

---

## Summary: Frontend/Backend Alignment Status

| Aspect | Status | Notes |
|--------|--------|-------|
| **Data Source** | 100% MOCK | No backend integration |
| **Opportunity DTO** | MISALIGNED | Significant field differences |
| **Evidence Concept** | FRONTEND-ONLY | Backend has no evidence tracking |
| **Actions (pin/snooze)** | STUB | Console.log only |
| **TodayBoard Response** | INCOMPATIBLE | Frontend expects different structure |

### Integration Work Required

1. **Map backend `OpportunityDTO` to frontend `Opportunity`**
   - `angle` → `hook`
   - `primary_channel` + `suggested_channels` → `platforms[]`
   - `persona_id` → resolve to `brand_fit.persona` (name)
   - `pillar_id` → resolve to `brand_fit.pillar` (name)

2. **Add missing backend fields** or **adjust frontend expectations**:
   - `why_now` (array vs single string)
   - `why_now_summary`
   - `lifecycle`
   - `trend_kernel`
   - `format_target`
   - `brand_fit.voice_reason`
   - `signals`
   - `evidence_ids` / `evidence`

3. **Evidence system**:
   - Backend needs to track and return evidence
   - Or frontend needs to remove evidence display entirely

4. **Status management**:
   - Backend: `is_pinned`, `is_snoozed` booleans
   - Frontend: `status` enum
   - Need mapping layer

---

*End of Audit Document*
