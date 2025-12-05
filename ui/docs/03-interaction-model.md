# 03 – Interaction Model (Kairo Hero Demo UI)

## 1. Purpose

This doc defines **how users interact** with the Kairo hero demo UI:

- How selection, editing, and navigation work across screens.
- How the **assistant** behaves and what context it sees.
- How we handle **loading, empty states, errors** in the demo.
- How we surface **learning hooks** (feedback events) without making the UX noisy.

It is downstream of:

- `01-hero-week-narrative.md`
- `02-routes-and-screens.md`
- `system/docs/architecture/*`
- `system/docs/03-canonical-objects.md`

The goal: a dev (or Claude Code) can wire interactions **without inventing UX** on the fly.

---

## 2. Core Interaction Principles

We’ll keep a few global rules:

1. **Minimal mental load**
   - Fewer decisions per screen; obvious primary action.
   - No more than 1–2 “important” CTAs per panel.

2. **One primary object in focus**
   - Today: an **OpportunityCard** (or “the batch”).
   - Packages: a **ContentPackage**.
   - Package detail: a **ContentVariant** or **CoreArgument**.
   - Calendar: a **PublishingJob** or “slot”.
   - Analytics: a **ContentVariant** or **PatternTemplate** summary.

3. **Assistant as “thinking partner”, not chatbot**
   - Assistant is always **contextual**:
     - inherits current page + selected object.
   - Prefers **actions on existing objects** over vague replies.

4. **Optimistic, low-friction edits**
   - UI updates immediately, even if the backend is stubbed.
   - Edits feel lightweight; no modal forms unless necessary.

---

## 3. Global Patterns

### 3.1 Selection Model

We standardize selection so the assistant + right panels behave consistently.

- **Single-selection as default**:
  - Clicking an element (card, row, post) selects it and shows it as focused:
    - subtle border, background, or left bar.

- **Multi-selection** (where needed):
  - Checkbox on cards/rows when multi-select makes sense:
    - e.g. selecting multiple **OpportunityCards**,
    - or multiple **ContentVariants** for scheduling.
  - Shift-click or Cmd-click not needed for the demo; checkboxes are enough.

- **Selection state location**:
  - Stored client-side in page-level state:
    - `selectedOpportunityId(s)` on Today.
    - `selectedPackageId` on Packages list.
    - `selectedVariantId` on Package detail.
    - `selectedPublishingJobId` or `selectedSlot` on Calendar.
    - `selectedAnalyticsRowId` on Analytics.

### 3.2 Primary Actions

Every main panel has **1–2 primary buttons**:

- Today:
  - Per opportunity: **Open as package**.
  - Top-level: "Add external source" (demo-only, may be stub).

- Packages:
  - Per card: **Open package**.
  - Top-right: "New package" (can be mostly decorative in hero demo).

- Package detail:
  - "Schedule selected variants".
  - "View in calendar".

- Calendar:
  - Drag to schedule.
  - “Auto-distribute” (demo-only, via assistant or a button).

- Analytics:
  - “Save as example” (turn variant → BrandMemoryFragment).
  - “Send feedback” (basic rating / thumbs).

### 3.3 Assistant Invocation

The **Kairo Assistant** is invoked in three ways:

- **Global**:
  - Keyboard: e.g. `Cmd+K`.
  - Top-right omnipresent button: “Ask Kairo”.

- **Contextual**:
  - Inline on key objects:
    - e.g. “Ask Kairo about this opportunity”,
    - “Improve this post with Kairo”.

- **Automatic pre-fill**:
  - When opened from context, the assistant pre-populates:
    - short system-style note like “You’re looking at Opportunity opp_501 for persona X, pillar Y…”
    - and optionally a suggested first question.

The assistant drawer:

- Slides from **right side**.
- Does **not** block interaction with the main view (you can close it any time).
- Remembers **per-screen conversation** for the duration of the session (no need for cross-screen persistence in demo).

---

## 4. Screen-Specific Interaction Flows

### 4.1 `/` – Brand Selection

**Core interactions:**

- Hover over a brand card:
  - Elevation + subtle animation.
- Click "Enter workspace":
  - Navigates to `/<brandSlug>/today`.

No assistant here, or it can be disabled for simplicity.

---

### 4.2 `/<brandSlug>/today` – Today View

**Goal**: help the user pick a small set of opportunities to act on.

#### 4.2.1 Opportunity Cards

- Click on a card:
  - Selects it.
  - Expands detail area (if we show extra body / source excerpt).

- Card-level actions:
  - **Pin**:
    - Toggles pinned state (visual pin icon).
    - Pinned cards float to top.
  - **Snooze**:
    - Moves card to “Later” subsection (within same view).
  - **Ignore**:
    - Minimizes / greys it out.
  - **Open as package** (primary action):
    - Either:
      - Creates (fake) `ContentPackage` and navigates,
      - Or opens a pre-seeded one for the hero demo.

#### 4.2.2 Interaction Flow: “Turn opportunities into work”

1. User lands on Today.
2. They scan top 3–5 high-scoring opportunities.
3. They click one → see more detail.
4. They click **Open as package**.
5. They are navigated to that package’s detail page.

#### 4.2.3 Assistant on Today

- When opened from an OpportunityCard:
  - Pre-fills with:
    - current **Brand**, **BrandBrainSnapshot**,
    - selected **OpportunityCard**,
    - its **source_refs**.

- Typical flows:
  - “Why is this scored 82?”
  - “Give me alternative ways to angle this trend for RevOps.”

Assistant responses are **explanatory + suggestive**, not editing text yet.

---

### 4.3 `/<brandSlug>/packages` – Packages List

**Goal**: let the user understand the workload and jump into the package that matters.

#### 4.3.1 Filtering & Sorting

- Filters:
  - Status: clickable pills at top (e.g. All / Draft / Approved / Scheduled / Published).
  - Channels: icon filters (LinkedIn, X).
  - Persona/Pillar: dropdown or multi-select.

- Sorting:
  - By default: “Last updated”.
  - Optionally: by persona/pillar or status.

Filters update the list **instantly** (no heavy UX here).

#### 4.3.2 Package Card Interactions

- Click anywhere on card:
  - Navigate to `/<brandSlug>/packages/<contentPackageId>`.

- Hover:
  - Show secondary info (e.g. “3 LinkedIn variants, 2 X variants”, status breakdown).

We intentionally avoid multi-select here for the demo.

#### 4.3.3 Assistant on Packages List

- Context:
  - Brand,
  - Current filters,
  - visible **ContentPackage** summaries.

- Typical flows:
  - “Which 2 packages should we finalize for LinkedIn first?”
  - “Show me packages that haven’t been touched in the last week.”

Assistant replies can:
- highlight certain packages,
- suggest filters (“Filter by persona X and pillar Y”).

In the demo, highlighting can just mean “Kairo suggests you click this card” in text, we don’t need full visual highlight wiring.

---

### 4.4 `/<brandSlug>/packages/<contentPackageId>` – Package Workspace

This is the **heaviest interaction** screen.

#### 4.4.1 Editing Core Argument

- Thesis:
  - Inline editable area.
  - When the user clicks, show focused state and Save / Cancel soft controls.
  - Save applies immediately to local state.

- Supporting points:
  - Each bullet is a row with:
    - text,
    - drag handle (visual only in the demo),
    - delete icon.
  - Adding:
    - “+ Add supporting point” row at bottom.

For demo, all edits can be stored in local state; no backend needed.

#### 4.4.2 Channel Plans & Variants

- Each channel (LinkedIn / X) panel:
  - Shows active **PatternTemplate** as chips:
    - clickable to show pattern structure in a tooltip.

- Variants list:
  - Click a variant:
    - Selects it and opens **inline editor**:
      - text area with the full body,
      - status dropdown (draft/edited/approved).
  - Side actions per variant:
    - “Ask Kairo to improve” button.
    - “Duplicate” button:
      - clones into a new ContentVariant with “(Copy)” appended.
    - “Reject”:
      - sets status to `rejected`, greyed out.

#### 4.4.3 Scheduling from Package

- Checkbox to select one or more variants (per channel).
- “Schedule selected variants” button (top-right of main content).
- On click:
  - In hero demo, we can:
    - either open a modal with time picker,
    - or navigate to Calendar with a pre-selected set of variants.

Simplest: navigate to Calendar with query param like `?selected=cv_300,cv_301` and pre-highlight them.

#### 4.4.4 Assistant on Package Workspace

- Context:
  - Current **ContentPackage**, **CoreArgument**,
  - Selected **ContentVariant**,
  - **PatternTemplate**,
  - **BrandRuntimeContext**.

- Typical flows:
  - “Rewrite this variant with the same pattern but more story.”
  - “Give me a new hook that hits this specific pain point.”

In the demo:

- We don’t need to wire actual content replacement.
- But for a strong experience:
  - pressing a “Apply suggestion” button could:
    - replace the variant body with the assistant’s proposed version,
    - set status to `edited`.

---

### 4.5 `/<brandSlug>/calendar` – Scheduling

#### 4.5.1 Scheduling Model

- Right-side “Ready to schedule” panel:
  - Each entry is a **ContentVariant** in `approved` state without a **PublishingJob**.
  - Click + drag into a day column:
    - Creates a pseudo-PublishingJob at a default time (e.g. 10:00).

- Within the calendar:
  - Posts are small cards that can be:
    - dragged vertically (change time),
    - moved to another day.

For the hero demo, drags only need to update in-memory state.

#### 4.5.2 Slot Selection & Details

- Clicking a scheduled post:
  - Opens a simple side panel or modal:
    - shows full text,
    - channel,
    - scheduled_at,
    - a “cancel publishing” button (sets status to `canceled`).

- Optionally, clicking an empty slot:
  - Could pre-open a “Schedule from ready list” UI, but not required for demo.

#### 4.5.3 Assistant on Calendar

- Context:
  - Current week’s **PublishingJobs**,
  - Candidate unscheduled variants,
  - Basic BrandRuntimeContext if we want to encode preferred days/hours.

- Typical flows:
  - “Spread these 3 posts over the week so there’s one CMO-focused piece every other day.”
  - “Check if we’re overcrowding Tuesdays on LinkedIn.”

In the demo we can:
- let Kairo respond in text,
- not automatically rearrange; but we can simulate “Kairo suggested” with a manual drag by the demo operator.

---

### 4.6 `/<brandSlug>/analytics` – Learning & Insights

#### 4.6.1 Post Table Interactions

- Table rows:
  - Each row = **ContentVariant** with metrics.
  - Clicking a row:
    - Shows side panel with:
      - full text,
      - persona/pillar,
      - pattern name,
      - detailed fake metrics.

- Row actions:
  - “Save as example”:
    - Creates a **BrandMemoryFragment** internally (demo stub).
    - Shows a small toast: “Saved to brand memory.”
  - “Too clickbaity”:
    - Creates a **FeedbackEvent** (demo stub).
    - Could show a note like “Kairo will tone down similar hooks next time.”

#### 4.6.2 Pattern & Persona Insights

- Pattern chart:
  - Hovering a bar (pattern) shows:
    - average engagement,
    - times used,
    - persona/pillar combos where it worked best.

- Persona/pillar chart:
  - Hovering shows:
    - count of posts,
    - average engagement.

No heavy interactions beyond hover/tooltips.

#### 4.6.3 Assistant on Analytics

- Context:
  - Aggregated **PatternUsage**,
  - **BrandPreferences**,
  - visible table rows.

- Typical flows:
  - “What did we learn this week for LinkedIn?”
  - “Summarize what works for RevOps vs CMOs.”

Assistant replies should point to **next actions**:
- “You should prioritize confessional stories for CMOs on LinkedIn next week.”

---

## 5. Feedback & Learning Hooks in the UI

Even though the hero demo is stubbed, we visually encode learning hooks so future real wiring is obvious.

### 5.1 FeedbackEvent Sources

We define where **FeedbackEvent** UI hooks appear:

- On **ContentVariant**:
  - “Save as example” (Analytics or Package detail).
  - “Never again like this” / “Too generic” (Analytics).

- On **OpportunityCard**:
  - “Not relevant” (Today view).
  - “Great angle” (star/favorite).

- On **PatternTemplate** (patterns view within Analytics, if we choose to expose it):
  - “Works for us” / “Not our style”.

In the demo, all of these can just show toasts and update local state; no need to persist.

### 5.2 Surfacing Learning

We reflect learning in **Analytics**:

- “What Kairo adjusted” sidebar:
  - E.g. “Confessional pattern weight increased for persona Data-driven CMO.”
  - These are hard-coded but conceptually tied to **BrandPreferences**.

---

## 6. Loading, Empty, and Error States

Even for a demo, we don’t want raw skeletons or blank screens.

### 6.1 Loading

- General pattern:
  - Use lightweight skeletons:
    - cards for Today,
    - rows for Packages & Analytics,
    - calendar placeholders.
- We can simulate loading briefly on route change during the hero demo (optional).

### 6.2 Empty States

We only need a few realistic empty states:

- Today:
  - If no opportunities:
    - Message: “No fresh opportunities right now. Paste a link or sync a source to get started.”
    - CTA: “Add a link” (opens a small fake input).

- Packages:
  - If no packages:
    - Message: “No content packages yet. Turn a trend into a package from the Today view.”

- Calendar:
  - If no posts scheduled:
    - Message: “Nothing scheduled this week. Drag approved posts here to plan your content.”

- Analytics:
  - If no metrics:
    - Message: “You don’t have published posts yet this week. Once you publish, Kairo will start learning.”

For the hero demo, most views will be pre-populated; these are mostly for completeness.

### 6.3 Error States

- Keep errors **non-dramatic**:
  - If a fake API call “fails”, show:
    - inline message: “Something went wrong. Try again.”
  - In the demo, we can avoid actual failures and just keep an error component ready.

---

## 7. Keyboard & Mouse Conventions

### 7.1 Keyboard

For demo, we add a minimal set:

- `Cmd+K` (or `Ctrl+K` on Windows):
  - Open / close Kairo Assistant.

- Within assistant:
  - `Enter` to send message.
  - `Shift+Enter` for new line.

Anything beyond this is optional; don’t overcomplicate.

### 7.2 Mouse

- Left click:
  - Selection, navigation, open assistant from buttons.

- Drag & drop:
  - Only in Calendar (and maybe between panels for scheduling).
  - No drag selection or fancy gestures.

---

## 8. Demo Constraints vs Future Real App

For clarity:

- The hero demo:
  - Uses **stubbed data**, deterministic flows.
  - Does not need full auth, real scraping, or real scheduling APIs.
  - Must **feel** like a cohesive, mature app.

- The real app later:
  - Will replace stubs with real APIs using the **same canonical object shapes**.
  - Will wire feedback interactions to actual **Learning Engine** updates.
  - Will make assistant responses truly reflect backend state.

As long as we respect this interaction model, swapping stubs for live systems should not require a redesign.