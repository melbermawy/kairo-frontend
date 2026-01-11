# Kairo Frontend Spec — Brand Onboarding + BrandBrain v1

**Status:** implementation-grade
**Frontend:** Next.js 16 App Router, React 19, Tailwind v4 tokens, Zod contracts
**Backend source of truth:** BrandBrain System Spec v2.1.1 (Django + Postgres)

---

## 0) Goal and Slice Boundaries

### Goal (this slice)

Ship a working loop where a user can:
1. create/select a brand
2. connect sources + answer onboarding questions
3. trigger BrandBrain compile (async) + see status
4. view BrandBrain snapshot with provenance
5. override + pin fields and see them persist after recompile

### Not in scope (explicit)
- Opportunities UI changes
- Content packages UI changes
- Auth/multi-tenant UX polish
- LinkedIn profile posts (unvalidated) in default UX
- Any "budget" surfaced to users (caps remain backend-only)

---

## 1) Reality check: existing frontend vs new BrandBrain contracts

Today the frontend has Brand (voice_traits/pillars/personas/guardrails) and a /strategy page that looks like a strategy "document".

BrandBrain backend introduces a different truth:
- `BrandOnboarding.answers_json` (tiered questions)
- `SourceConnection` objects
- `BrandBrainSnapshot.snapshot_json` (FieldNodes with sources/confidence/override_value)
- `BrandBrainOverrides` (overrides_json + pinned_paths)

**Decision:** keep the current nav route `/brands/[brandId]/strategy` but repurpose it to be the BrandBrain page (read + override). "Strategy" becomes "BrandBrain" in UI text, but route can stay for minimal churn.

---

## 2) Architecture decisions (to prevent rework)

### 2.1 API client design

Keep the current "contract-first + Zod-validated API layer" pattern:
- **Current:** `src/lib/mockApi/client.ts` returning fixtures validated via `src/contracts/index.ts`
- **Add:** `src/lib/api/client.ts` for real backend HTTP requests, validated with the same Zod schemas

**Env switch:**
- `NEXT_PUBLIC_API_MODE = "mock" | "real"`
- `mock` uses existing mockApi
- `real` uses apiClient (fetch + zod parse)

No duplicated DTOs. Zod is the source of truth.

### 2.2 Data fetching strategy

Do not introduce React Query unless you already use it elsewhere. Keep it simple and consistent with current code style:
- Use Next server components for basic GET pages (brand list, brand shell)
- Use `"use client"` components for:
  - onboarding autosave
  - compile status polling
  - overrides patching

Polling is manual (setInterval + abort controller) with clear rules.

---

## 3) Routes and Screens

### 3.1 Routes (new/repurposed)
- `/brands` (optional, if you already have a list selector)
- `/brands/[brandId]/onboarding` (new) — onboarding wizard + sources
- `/brands/[brandId]/strategy` (repurposed) — BrandBrain snapshot + overrides/pins + provenance
- (optional) `/brands/[brandId]/sources` — only if you want sources separated; otherwise include in onboarding

### 3.2 Sidebar nav

Replace "Strategy" label with "BrandBrain" but keep route to avoid breaking deep links:
- label: `BrandBrain`
- href: `/brands/[brandId]/strategy`

---

## 4) Backend API Contracts the frontend will use

The backend spec has partial endpoints. Frontend needs async compile + status + evidence fetch for provenance.

### 4.1 Required endpoints (must exist)

**Brands**
- `POST /api/brands`
- `GET /api/brands`
- `GET /api/brands/:id`

**Onboarding**
- `PUT /api/brands/:id/onboarding`

Request:
```json
{ "tier": 0, "answers_json": { "tier0.what_we_do": "..." } }
```

Response:
```json
{ "brand_id":"...", "tier":0, "answers_json":{}, "updated_at":"..." }
```

**Sources**
- `POST /api/brands/:id/sources`
- `PATCH /api/sources/:id`

**BrandBrain**
- `POST /api/brands/:id/brandbrain/compile`
- `GET /api/brands/:id/brandbrain/latest`
- `GET /api/brands/:id/brandbrain/history`
- `PATCH /api/brands/:id/brandbrain/overrides`

### 4.2 Missing-but-needed additions (to avoid fake UX)

These are not clearly in backend spec but the UI needs them:

**Compile async status**

Option A (preferred):
- `POST /api/brands/:id/brandbrain/compile` returns `{ compile_run_id, status }`
- `GET /api/brands/:id/brandbrain/compile/:compile_run_id` returns status + progress + error

Status shape:
```json
{
  "compile_run_id": "...",
  "status": "QUEUED|RUNNING|SUCCEEDED|FAILED",
  "progress": {
    "stage": "ENSURE_EVIDENCE|NORMALIZE|BUNDLE|LLM|QA|MERGE|DONE",
    "percent": 0
  },
  "started_at": "...",
  "updated_at": "...",
  "error": null
}
```

**Evidence lookup for provenance viewer**
- `GET /api/evidence/:id` (or batch `POST /api/evidence/batch`)

Return minimal:
```json
{
  "id":"nei_123",
  "platform":"instagram",
  "content_type":"reel",
  "canonical_url":"...",
  "published_at":"...",
  "author_ref":"...",
  "title":null,
  "text_primary":"...",
  "text_secondary":"...",
  "metrics_json":{},
  "media_json":{}
}
```

**Source connection health / freshness (optional but strongly recommended)**
- `GET /api/sources/:id/status`

```json
{
  "source_connection_id":"...",
  "latest_run": {
    "apify_run_id":"...",
    "status":"SUCCEEDED|FAILED|RUNNING",
    "finished_at":"..."
  }
}
```

If you refuse to add this, frontend cannot honestly show ingestion state per source. It can only show "last compiled".

---

## 5) Frontend Zod Contracts to add

Add these to `src/contracts/index.ts` (or split into `contracts/brandbrain.ts` and export).

### 5.1 Brand

Backend Brand is minimal:
```
Brand = { id, name, website_url?, created_at? }
```

Frontend currently expects slug, vertical, etc. Those are mock-era. For this slice:
- either introduce `BrandCore` for backend and keep existing `Brand` for old UI
- or migrate `Brand` to backend shape and create `BrandViewModel` for existing today/packages pages

**Decision for speed:** create `BrandCore` + keep existing `Brand` until later.

### 5.2 Onboarding

```typescript
BrandOnboarding = {
  brand_id: string
  tier: 0|1|2
  answers_json: Record<string, any>
  updated_at: string
}
```

### 5.3 SourceConnection

```typescript
SourceConnection = {
  id: string
  brand_id: string
  platform: "instagram"|"linkedin"|"tiktok"|"youtube"|"web"
  capability: "posts"|"reels"|"company_posts"|"profile_posts"|"profile_videos"|"channel_videos"|"crawl_pages"
  identifier: string
  is_enabled: boolean
  settings_json: Record<string, any>
  updated_at: string
}
```

### 5.4 FieldNode

This is the leaf primitive.

```typescript
FieldNode<T> = {
  value: T
  confidence: number
  sources: Array<
    | { type: "answer"; id: string }
    | { type: "evidence"; id: string }
  >
  locked: boolean
  override_value: T | null
}
```

### 5.5 Snapshot schema (strict enough to render)

At minimum enforce:
- required top-level keys exist
- each leaf matches FieldNode

Do not overfit every nested detail yet, but require predictable section structure:
- positioning
- voice
- pillars
- constraints
- platform_profiles
- examples
- meta

### 5.6 Overrides

```typescript
BrandBrainOverrides = {
  brand_id: string
  overrides_json: Record<string, any> // field_path -> override value
  pinned_paths: string[]
  updated_at: string
}
```

---

## 6) UX Flows (deterministic)

### 6.1 Onboarding Wizard (/brands/[brandId]/onboarding)

**Layout**

Two-column desktop:
- left: steps + completion
- right: form

Mobile: single column.

**Steps (exact order)**
1. Basics (Tier 0 required)
2. Platforms & sources
3. Tier 1 (recommended)
4. Tier 2 (optional power)
5. Compile

**Save behavior**
- autosave each step with debounce 600ms
- explicit "Save" button also available
- show "Saved" / "Saving…" in top-right

**Tier 0 Questions (required)**

From backend spec section 6:
- `tier0.what_we_do` string
- `tier0.who_for` string
- `tier0.edge` string[]
- `tier0.tone_words` string[]
- `tier0.taboos` string[]
- `tier0.primary_goal` enum string
- `tier0.cta_posture` enum string

**UI widgets**
- strings: textarea with character guidance
- string[]: token input (KTag style) with max counts suggested
- enums: radio cards

**Tier 1**
- `tier1.priority_platforms` string[]
- `tier1.pillars_seed` string[] (optional)
- `tier1.good_examples` list (optional)
- `tier1.key_pages` string[] (optional URLs)

**Key pages rule (matches backend):**
- allow any URLs in UI
- show hint: "About / Pricing / Case studies"
- server clamps to 2 for extra_start_urls

**Tier 2**
- `tier2.platform_rules.<platform>` object (optional)
- `tier2.proof_claims` list (optional)
- `tier2.risk_boundaries` string[] (optional)

Represent as collapsible sections per platform.

---

### 6.2 Sources UI (inside onboarding)

**Supported sources in v1**
- Instagram posts (instagram/posts)
- Instagram reels (instagram/reels)
- LinkedIn company posts (linkedin/company_posts)
- TikTok profile videos (tiktok/profile_videos)
- YouTube channel videos (youtube/channel_videos)
- Web crawl pages (web/crawl_pages)

**Explicitly hidden by default**
- LinkedIn profile posts (linkedin/profile_posts) behind `FEATURE_LI_PROFILE_POSTS=false`

**Add source modal**

Fields:
- Platform dropdown
- Capability dropdown (filtered by platform)
- Identifier input (URL/handle)
- Enabled toggle default true

**Client-side normalization rules:**
- TikTok: strip leading @
- Instagram: accept profile URL; if handle pasted, convert to `https://www.instagram.com/<handle>/`
- YouTube: accept channel URL
- LinkedIn company: accept URL; backend extracts slug
- Web: use `brand.website_url` by default; allow override

---

### 6.3 Compile flow

**Where compile is triggered**
- final step of onboarding
- also from BrandBrain page header

**Compile button rules**

Enabled when:
- tier0 answers complete
- at least 1 enabled SourceConnection exists OR website_url exists for web (you choose; simplest is require at least 1 source)

**Compile is async**
- POST compile returns `compile_run_id`
- UI enters "Compiling…" state + poll status endpoint

**Polling rules:**
- every 2s for first 60s
- then every 5s up to 5 minutes
- stop on SUCCEEDED/FAILED
- show "still working" state with stage + percent

**Error rules:**
- show error text, plus "Retry compile"
- retry uses same request with `force_refresh=false`
- dev-only "Force refresh" toggle behind `BRANDBRAIN_DEV_MODE`

**Freshness messaging (no budget)**

On BrandBrain page header:
- "Last compiled: …"
- "Status: Up to date / Stale" based on `now - compiled_at` threshold
- UI threshold: 24h (match TTL default)
- you're not exposing TTL as a concept, just the result: up to date/stale

---

### 6.4 BrandBrain page (/brands/[brandId]/strategy repurposed)

**Layout**
- Top: BrandBrain header (brand name, last compiled, status, Compile button)
- Body: sections with FieldNodes
- Right panel (desktop): provenance viewer / edit panel (not a doc editor)

**Section rendering map (v1)**

- **Positioning**
  - positioning.what_we_do
  - positioning.who_for
  - positioning.differentiators
  - positioning.proof_types
- **Voice**
  - voice.tone_tags
  - voice.do
  - voice.dont
  - voice.cta_policy
  - voice.emoji_policy
- **Pillars**
  - list of pillars[] nodes
- **Constraints**
  - constraints.taboos
  - constraints.risk_boundaries
- **Platform profiles**
  - render only connected platforms first; others collapsed
- **Examples**
  - examples.canonical_evidence
  - examples.user_examples
- **Meta (read-only)**
  - compiled_at
  - evidence_summary
  - missing_inputs

**Editing model: overrides + pins (no freeform doc)**

For any editable FieldNode:
- click value → opens FieldEditPanel
- show:
  - current inferred value
  - override input
  - pin toggle
  - sources list (answers + evidence)
  - confidence

**Save action:**
- PATCH overrides endpoint with `set_overrides` + pin/unpin ops
- after save:
  - refetch latest snapshot
  - refetch overrides

**Hard rule:** UI never directly mutates snapshot JSON; it only writes overrides.

---

## 7) Components to implement (explicit)

**Pages**
- `app/brands/[brandId]/onboarding/page.tsx` (server shell)
- `app/brands/[brandId]/strategy/page.tsx` (server shell)

**Client components**
- `OnboardingWizardClient`
- `Tier0Form`, `Tier1Form`, `Tier2Form`
- `SourcesManager` + `AddSourceModal`
- `CompilePanel` + `CompileStatusBadge`
- `BrandBrainClient`
- `BrandBrainSection`
- `FieldNodeView`
- `FieldEditPanel`
- `ProvenanceList`
- `EvidencePreviewCard` (for evidence sources)

**UI patterns**

Use existing primitives:
- `KCard`, `KButton`, `KTag`

No new design system.

---

## 8) Provenance viewer behavior

When a FieldNode is focused:
- show sources grouped:
  - **Onboarding answers** (just show question label + user's answer)
  - **Evidence items** (preview + open canonical URL)

Requires:
- question catalog map (question_id → label + tier)
- evidence endpoint (or evidence embedded in snapshot)

No citations "doc editor". This is a source list panel.

---

## 9) Integration with existing UI (avoid breaking today page)

Right now /today relies on the old Brand object for voice/pillars/personas.

**Decision for this slice:**
- do not refactor opportunities/packages now
- keep mock brand for those pages
- BrandBrain pages use backend BrandCore + snapshot

Later we'll unify.

**Minimal glue:**
- BrandShell can keep using brand name + id
- Sidebar nav continues to work

---

## 10) Feature flags

**Frontend env flags:**
- `NEXT_PUBLIC_API_MODE=mock|real`
- `NEXT_PUBLIC_BRANDBRAIN_DEV_MODE=true|false`
- `NEXT_PUBLIC_FEATURE_LI_PROFILE_POSTS=true|false`

**Behavior:**
- LI profile posts hidden unless flag true
- "Force refresh compile" hidden unless dev mode

---

## 11) Acceptance criteria (Definition of Done)

1. Onboarding Tier 0 can be completed and saved
2. At least one SourceConnection can be created + toggled enabled
3. Compile can be triggered and UI shows progress + terminal result
4. Latest BrandBrain snapshot renders sections deterministically
5. Editing any field writes overrides and persists across refresh
6. Pinning works: pinned field stays after recompile
7. Provenance panel lists sources; evidence entries open canonical URL
8. No budget/cap language anywhere in UI

---

## 12) File placement in repo

- **Spec doc:** `ui/docs/BRANDBRAIN_FRONTEND_SPEC.md`
- **Contracts:** `ui/src/contracts/brandbrain.ts` (export in `contracts/index.ts`)
- **API layer:** `ui/src/lib/api/client.ts` (mirror mockApi method names)
- **Feature flags:** `ui/src/lib/env.ts` (centralize)
