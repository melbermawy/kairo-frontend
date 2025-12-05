# 02 – Routes and Screens (Kairo Hero Demo UI)

## 1. Purpose

This doc defines the **routes and core screens** for the Kairo hero demo UI.

- It assumes a **Next.js (App Router) + TypeScript** frontend.
- It is **demo-only**: all data is fake and returned by stubbed APIs.
- It must be consistent with:
  - `system/docs/03-canonical-objects.md`
  - `system/docs/architecture/01-overall-system.md`
  - `ui/docs/01-hero-week-narrative.md`

The goal is that a dev (or Claude Code) can implement the entire hero demo with **no additional product decisions**.

---

## 2. Route Map (Top-Level)

We’ll keep routes opinionated and minimal.

### 2.1 Public shell

- `/`
  - **Landing / brand select** (for the demo).
  - Lists **demo brands** (for now effectively just `Northshore Analytics`).
  - Clicking a brand takes you to `/<brandSlug>/today`.

> In real life this would be behind auth and show a list of brands the user is on. For the hero demo, treat this as “choose demo brand”.

---

### 2.2 Brand-scoped routes

All main app routes are **brand-scoped**:

- `/<brandSlug>/today`
- `/<brandSlug>/packages`
- `/<brandSlug>/packages/<contentPackageId>`
- `/<brandSlug>/calendar`
- `/<brandSlug>/analytics`

Where:

- `brandSlug` maps to **Brand.slug** (e.g. `northshore-analytics`).
- `contentPackageId` maps to **ContentPackage.id**.

We do **not** need nested routing complexity; App Router segments are enough.

---

## 3. Shared Layout & Shell

### 3.1 App Frame

All brand routes share a common shell:

- **Top nav bar**:
  - Left:
    - Kairo logo + product name.
    - Brand switcher (even if only one demo brand).
  - Center:
    - Tabs or segmented control:
      - Today
      - Packages
      - Calendar
      - Analytics
  - Right:
    - User avatar / name (fake).
    - Assistant launcher (if we want it here in addition to keyboard shortcut).

- **Side rail (left)**:
  - Brand mini-summary (from Brand & BrandBrainSnapshot):
    - Brand name, vertical.
    - Current focus personas/pillars (chips).
    - Tone snippet.
  - Quick stats:
    - This week: `X` posts scheduled, `Y` already published (fake).

- **Main content area**:
  - Swaps based on the active route (Today / Packages / Calendar / Analytics).

### 3.2 Assistant (Global)

The **Kairo Assistant** is a global, context-aware drawer:

- Trigger:
  - Keyboard (e.g. `Cmd+K`) and/or top-right button.
- Appearance:
  - Slides in from right, overlaying main content but not full-screen.
- Context:
  - Reads the **current screen + selected entity** (see sections below).

The UI only needs to show:

- A conversation-like window with:
  - prompt input,
  - message bubbles (User / Kairo),
  - 1–2 canned prompt suggestions per screen.

No need to implement complex history; a minimal session is enough for the demo.

---

## 4. Screens by Route

### 4.1 `/` – Brand Selection (Demo Entry)

**Goal**: Quickly drop the viewer into the hero brand experience.

**Main elements:**

- **Hero card** for `Northshore Analytics`:
  - Brand name, vertical, 1-line description.
  - Primary channels (LinkedIn / X icons).
  - “Enter workspace” button → navigates to `/<brandSlug>/today`.

- Secondary (optional) brand cards:
  - E.g. another fake brand grayed out with “coming soon”.
  - Optional only; don’t overcomplicate.

No deep functionality here; this is mostly visual and helps frame the demo.

---

### 4.2 `/<brandSlug>/today` – Today View (Opportunities)

This is the **home** for the hero week. It showcases the **Opportunities Engine** and how easily you can open a ContentPackage.

#### 4.2.1 Data it shows (canonical objects)

- Brand summary (from **Brand**, **BrandBrainSnapshot**, **BrandRuntimeContext**):
  - Positioning,
  - Tone descriptors,
  - Focus personas/pillars.

- Today’s opportunities:
  - One **OpportunityBatch** (for today).
  - Multiple **OpportunityCard** entries.

- Quick schedule overview:
  - Aggregated info from **PublishingJob** + **ContentVariant** (read-only summary).

#### 4.2.2 Layout

- **Top of main area**:
  - “Today for Northshore Analytics”
  - Subheading: “Fresh opportunities, on-brand.”

- **Left**:
  - **Today’s Opportunities panel**:
    - Kanban or stacked cards list:
      - high score cards highlighted.
    - Each card displays:
      - Persona + Pillar chips.
      - OpportunityType (trend, competitive, etc.).
      - Score (0–100) with badge.
      - Angle summary (2–3 lines).
      - Chip indicating **source** (e.g. “From article”, “From competitor post”).

- **Right**:
  - **“This week at a glance”**:
    - # of ContentPackages in progress.
    - # of posts scheduled (by channel).
    - A mini-calendar strip showing which days have posts.

- Card actions:
  - **Pin**,
  - **Snooze**,
  - **Ignore**,
  - **Open as package** (primary CTA).

#### 4.2.3 Interactions (for demo)

- Clicking **Open as package**:
  - Creates (in fake data layer) or reveals a pre-stubbed **ContentPackage**.
  - Navigates to `/<brandSlug>/packages/<contentPackageId>`.

- Assistant context:
  - Sees:
    - current **OpportunityBatch**,
    - selected **OpportunityCard(s)**,
    - BrandBrainSnapshot / BrandRuntimeContext.
  - Example canned prompts:
    - “Which 3 opportunities matter most for CMOs this week?”
    - “Explain why this opportunity has a high score.”

---

### 4.3 `/<brandSlug>/packages` – Packages List

This is a **workspace** for all ContentPackages for the brand.

#### 4.3.1 Data it shows

- List of **ContentPackage** objects for the hero week.
- Per package:
  - associated **OpportunityCard** (if any),
  - **CoreArgument** summary,
  - persona + pillar,
  - status,
  - channels involved,
  - basic analytics hints if already published (faux).

#### 4.3.2 Layout

- **Top bar**:
  - Filters:
    - by status (draft, in_review, approved, scheduled, published),
    - by channel (LinkedIn, X),
    - by persona/pillar.

- **Main list / grid**:
  - Each package card shows:
    - Title or short name (derived from CoreArgument thesis).
    - Persona/Pillar chips.
    - Origin (Trend / Evergreen / Campaign).
    - Channels (icons).
    - Status pill.
    - Micro-metric (if published):
      - e.g. “Avg engagement: 3.8%”.

- Primary actions:
  - Click **card** → `/<brandSlug>/packages/<contentPackageId>`.
  - Top-right button:
    - “New package” (for hero demo, can open a pre-populated package or show a coming-soon message).

#### 4.3.3 Assistant context

- Sees:
  - list of ContentPackages,
  - their statuses,
  - persona/pillar distribution.

- Example canned prompts:
  - “Show me packages that still need LinkedIn posts this week.”
  - “Which packages are most relevant to RevOps leads?”

---

### 4.4 `/<brandSlug>/packages/<contentPackageId>` – Package Workspace

This is the **core content engineering screen**.

#### 4.4.1 Data it shows

- **ContentPackage**:
  - status, origin, linked **OpportunityCard** (if any).

- **CoreArgument**:
  - thesis, supporting_points,
  - persona_id + pillar_id,
  - reference to BrandBrainSnapshot.

- **ChannelPlans** for this package:
  - For each channel (LinkedIn, X):
    - channel name,
    - pattern_bindings,
    - counts of variants.

- **ContentVariants**:
  - For each channel:
    - each ContentVariant with:
      - pattern_template_id,
      - body (text),
      - status,
      - persona/pillar tag,
      - mini metrics if published.

#### 4.4.2 Layout

- **Top section**:
  - inline breadcrumb:
    - `Today / Packages / “Attribution dashboards should tell a revenue story…”`
  - Package status with dropdown (Draft / In Review / Approved / etc.).
  - Buttons:
    - “Schedule selected variants”
    - “View in calendar”.

- **Left column**:
  - **Core Argument panel**:
    - Thesis (editable text area).
    - Supporting points (editable bullet list).
    - Persona / Pillar chips.
    - Source Opportunity info (link back to the originating opportunity).

- **Right column**:
  - Tabs or vertical stacks per channel:
    - LinkedIn block:
      - pattern badges (from PatternTemplate),
      - list of ContentVariants with:
        - body,
        - pattern name,
        - status (draft, edited, approved),
        - quick actions: “improve with Kairo”, “duplicate”, “reject”.
    - X block:
      - similar but shorter bodies.

- Within each variant:
  - Show a subtle hint like:
    - “Pattern: Confessional story → lesson”,
    - “Persona: Data-driven CMO”.

#### 4.4.3 Interactions (hero demo flow)

- Variant-level:
  - Clicking a variant opens it in an **inline editor** (right side).
  - Button “Ask Kairo” opens Assistant preloaded with that variant text and context.
  - Status changes:
    - `draft` → `edited` → `approved` via toggle or buttons.

- Package-level:
  - “Schedule selected variants” → navigate to `/<brandSlug>/calendar` with those variants pre-selected for scheduling.

#### 4.4.4 Assistant context

- Sees:
  - current ContentPackage,
  - CoreArgument,
  - selected ContentVariant,
  - BrandRuntimeContext,
  - PatternTemplate and pattern usage if available.

- Example canned prompts:
  - “Make this hook more concrete, keep same tone.”
  - “Rewrite this for RevOps instead of CMOs.”
  - “Give me a second variant that uses a story-driven pattern.”

---

### 4.5 `/<brandSlug>/calendar` – Scheduling

This screen is the **calendar view** for posts, powered by **ContentVariants** and **PublishingJobs**.

#### 4.5.1 Data it shows

- For a given week:
  - All **PublishingJobs** for the brand.
  - Linked **ContentVariants** (snippet of text).
  - Channel (LinkedIn / X).
  - Status (pending, success, failed).

- A side panel with:
  - “Approved but unscheduled” ContentVariants.

#### 4.5.2 Layout

- **Main area**:
  - Weekly grid (columns = days, rows = channels or time slots).
  - Each scheduled post appears as a small card:
    - channel icon,
    - time,
    - first line of text,
    - persona/pillar tags.

- **Right side panel**:
  - “Ready to schedule” list:
    - Each entry is a ContentVariant with:
      - channel,
      - snippet,
      - persona/pillar,
      - pattern badge.

#### 4.5.3 Interactions

- Drag & drop:
  - From “Ready to schedule” panel onto a calendar slot:
    - creates a **PublishingJob** in fake data.
  - Adjust time by dragging in calendar.

- Quick actions:
  - click scheduled post → show details (variant full text) in a modal.
  - change status to “cancel” for demo (no real API calls).

- Assistant context:
  - Sees:
    - upcoming PublishingJobs,
    - unscheduled approved variants,
    - BrandRuntimeContext (preferred times optional).

- Example canned prompts:
  - “Distribute these 3 posts across the week with at least 1 day between them.”
  - “What days have too many posts scheduled for CMOs?”

---

### 4.6 `/<brandSlug>/analytics` – Learning & Insights

This screen showcases the **Learning Engine** and **Patterns Engine** outputs to the user.

#### 4.6.1 Data it shows

- Summary stats:
  - # posts published this week (by channel).
  - Top performing persona/pillar combos.
  - Top PatternTemplates by engagement.

- Table of posts:
  - Each row = **ContentVariant** with:
    - channel,
    - persona/pillar,
    - pattern_template_id (rendered as pattern name),
    - faux metrics.

- “What Kairo learned” section:
  - Derived from **BrandPreferences** & **PatternUsage**:
    - e.g. “Confessional pattern + CMO on LinkedIn: 1.4× baseline.”

#### 4.6.2 Layout

- **Top**:
  - KPIs (cards):
    - “This week: 4 posts published”.
    - “Best performing persona: Data-driven CMO (4.2% avg engagement)”.
    - “Best pattern: Confessional story (1.4× baseline).”

- **Middle**:
  - Chart(s) (fake data):
    - Bar chart by pattern.
    - Bar or line chart by persona/pillar.

- **Bottom**:
  - Table of posts:
    - columns:
      - Date,
      - Channel,
      - Persona,
      - Pillar,
      - Pattern,
      - Impressions,
      - Engagement rate,
      - “Saved as example?” badge.

- Side panel (optional):
  - Headline: “What Kairo adjusted”.
  - A few bullet points summarizing weight changes (from BrandPreferences).

#### 4.6.3 Interactions

- Row-level actions:
  - “Save as example” → creates a new BrandMemoryFragment (fake).
  - “Too clickbaity” → triggers a FeedbackEvent.

- Assistant context:
  - Sees:
    - aggregated pattern performance,
    - per-post metrics,
    - BrandPreferences before/after updates.

- Example canned prompts:
  - “Explain why these two posts did well and what we should do more of.”
  - “What patterns underperformed on X this week?”

---

## 5. Assistant Context Map (Per Route)

For implementation, it’s useful to codify what the Assistant gets per screen:

- `/`:
  - **Context**: none (or minimal).
  - Mostly unused.

- `/<brandSlug>/today`:
  - Brand, BrandBrainSnapshot, BrandRuntimeContext.
  - Current OpportunityBatch and visible OpportunityCards.

- `/<brandSlug>/packages`:
  - Brand.
  - List of ContentPackages and minimal stats.

- `/<brandSlug>/packages/<contentPackageId>`:
  - Brand.
  - ContentPackage, CoreArgument, ChannelPlans.
  - Selected ContentVariant (if any).
  - Related PatternTemplates.

- `/<brandSlug>/calendar`:
  - Brand.
  - PublishingJobs for the visible week.
  - ContentVariants for scheduled and unscheduled posts.

- `/<brandSlug>/analytics`:
  - Brand.
  - ContentVariants with metrics.
  - PatternUsage summaries.
  - BrandPreferences snapshot (or diff).

This is enough context for the assistant to give **non-dumb answers** in the demo, even without a real backend.

---

## 6. Implementation Notes for the Demo

- Routing:
  - Use Next.js App Router with `app/[brandSlug]/.../page.tsx`.
- Data:
  - Backed by local fake APIs or in-memory data modules that return canonical-object-shaped JSON.
- Assistant:
  - Frontend-only mock:
    - For the demo we can either:
      - Hard-code a few scripted responses,
      - Or hook to an LLM with static prompts and seeded context.

The important part is **shape and behavior**, not real data fetching. These routes and screens give enough structure for a first hero build without hand-waving.