# 01 – Hero Week Narrative (Kairo Hero Demo)

## 1. Purpose

This document defines the **hero “perfect week” narrative** for Kairo’s frontend demo.

- It is **purely frontend**: all data is fake, all pipelines are stubbed.
- It exists to:
  - Show what a **mature, year-3 product** feels like (not an MVP toy).
  - Stress the **core loop**: from external signal → opportunity → package → variants → scheduling → learning.
  - Give Claude Code a concrete story to implement UI flows against.

Everything here should be implementable using only:

- the **canonical objects** (Brand, Persona, OpportunityCard, ContentPackage, ContentVariant, etc.)
- the **engines conceptual model** (Brand Brain, Opportunities, Patterns, Content Engineering, Learning)
- **fake API calls** in the UI repo.

---

## 2. Cast & Setup

### 2.1 Roles

For the hero demo, we assume:

- **Strategist** – sets direction, picks opportunities, reviews tone.
- **Creator** – edits drafts, tweaks hooks, adds story details.
- **Manager** – skims analytics, asks “what’s working?” questions.

All three are represented by the **same human user in the demo**; we just show different actions they might take.

### 2.2 Hero Brand

We use a single fake brand throughout:

- **Brand**: `Northshore Analytics`
- **Vertical**: B2B SaaS – marketing analytics / attribution
- **Primary channels**: LinkedIn, X
- **Personas** (3–4):
  - “Data-driven CMO”
  - “RevOps lead”
  - “In-house content lead”
- **Pillars** (3–4):
  - Strategy POV
  - Behind-the-scenes / ops
  - Customer stories
  - Tactical breakdowns

These values should be **visible in the UI** (e.g. brand switcher, persona tags, pillar tags), not just implied.

### 2.3 Starting State (before Monday)

We assume that for this hero week:

- Brand onboarding is **already done**:
  - Brand Brain is initialized (BrandBrainSnapshot exists).
  - Personas and Pillars exist and look reasonable.
  - Brand Memory has a handful of **example fragments**.
- Channels are configured:
  - LinkedIn + X are “connected” (fake ChannelConfig).
- There is already:
  - A backlog of **GlobalSourceDocs** (external articles / posts),
  - Some **PatternTemplates** learned from earlier posts.

We do **not** show onboarding in this hero demo. The week starts with a brand that has been running Kairo for a little while.

---

## 3. High-Level Weekly Arc

The week should tell one coherent story, not five unrelated ones.

**Arc**:

1. **Monday** – Strategist uses Kairo to pick a few strong **OpportunityCards** and spin up **ContentPackages**.
2. **Midweek** – Creator refines **ContentVariants**, uses assistant to adjust tone and specificity, and schedules posts.
3. **End of week** – Manager reviews **Analytics**, asks the assistant why certain patterns worked, and this feeds the **Learning Engine** (visibly changing future suggestions).

The demo UI should make it obvious that:

- Kairo is **not a single prompt box**.
- Kairo is **not a planner**.
- Kairo is an **agentic copilot** that:
  - surfaces structured opportunities,
  - engineers channel-specific content,
  - and learns from what actually happens.

---

## 4. Day-by-Day Narrative

### 4.1 Monday – “What should we talk about this week?”

**Entry screen**: `Today` for `Northshore Analytics`.

#### 4.1.1 What the user sees

- A **“Today’s Opportunities”** panel:
  - One **OpportunityBatch** for today with:
    - ~6–8 **OpportunityCards**, each with:
      - Persona + Pillar tags,
      - Angle summary (“Everyone is complaining about attribution dashboards; here’s what a good one looks like”),
      - Opportunity type (trend / competitive / evergreen),
      - Score (0–100).
  - A clear visual distinction between:
    - **High-priority** opps (e.g. score > 80),
    - Medium / low opps.

- A **Brand context summary** panel:
  - Short recap from Brand Brain:
    - Positioning,
    - Tone descriptors,
    - Current focus personas/pillars (top 2–3).

- A **glimpse of “This Week”**:
  - Small overview of:
    - planned packages,
    - how many posts are already scheduled.

#### 4.1.2 Actions taken

In the hero walk:

1. Strategist scans the opportunities and:
   - **Pins** 2 strong ones,
   - **Snoozes** 1 (not this week),
   - **Ignores** 1 irrelevant one.

2. For a pinned OpportunityCard:
   - Clicks **“Open as Package”** → navigates to a **Content Package Workspace**.
   - Kairo auto-creates:
     - a **ContentPackage**,
     - a **CoreArgument** (thesis + supporting points),
     - **ChannelPlans** for LinkedIn and X,
     - and **2–3 ContentVariants** per channel.

3. Strategist makes a small tweak to the core argument (edit text), then:
   - Marks the package as **“Ready for drafting”** or leaves a note (e.g. “Emphasize board pressure”).

The UI must feel like: **one click from opportunity to rich, on-brand, multi-channel package**.

---

### 4.2 Midweek – “Make these drafts actually good”

**Entry screen**: `Content Package Workspace` for one hero package.

#### 4.2.1 What the user sees

For a single **ContentPackage**:

- **Core Argument**:
  - Thesis,
  - Supporting points,
  - Persona + Pillar tags.
- **Channel sections**:
  - LinkedIn block:
    - Pattern(s) applied,
    - 2–3 **ContentVariants** with statuses and pattern tags.
  - X block:
    - Shorter variants, possibly different patterns.

- An **inline analytics hint** (fake, but realistic):
  - e.g. “Posts using this pattern have 1.3× engagement with Data-driven CMOs.”

- A visible **Brand runtime knobs** snippet:
  - e.g. “LinkedIn tone: 40% story / 60% tactical; Aggressiveness: balanced.”

- The **Kairo Assistant** drawer:
  - Openable via a keyboard shortcut or a button in the top bar.
  - Context aware:
    - Knows which ContentVariant is selected,
    - Knows the CoreArgument,
    - Knows Persona + Pillar.

#### 4.2.2 Actions taken

In the hero walk:

1. Creator opens one LinkedIn variant that is decent but bland.
2. Invokes the **Assistant** with a request like:
   - “Make this hook more specific and add one concrete example, keep same tone.”
3. Assistant responds by:
   - Showing an updated version,
   - Explaining in 1–2 bullet points what changed.

4. Creator:
   - Accepts changes → `ContentVariant` body updates,
   - Manually edits one sentence.

5. For X:
   - Creator asks the Assistant:
     - “Give me 2 spicy variations targeting RevOps instead of CMOs.”
   - New variants are generated under same **ChannelPlan** but:
     - Persona changes,
     - Pattern may change to a more tactical format.

6. Creator marks 1 LinkedIn and 2 X variants as:
   - **“Approved for scheduling”**.

The UI should show **clear state changes** (draft → edited → approved) and make the Assistant feel like an in-place copilot, not a separate chatbot.

---

### 4.3 Scheduling – “Lock in the week”

**Entry screen**: `Calendar` or `Schedule` view for the brand.

#### 4.3.1 What the user sees

- A **weekly calendar** with:
  - Slots for each day + channel.
  - Visual indication of:
    - already scheduled posts,
    - empty but recommended slots (e.g. “best time” hints).

- A **side panel** listing:
  - Approved **ContentVariants** that are not yet scheduled.

#### 4.3.2 Actions taken

In the hero walk:

1. Creator drags an approved LinkedIn variant onto:
   - Wednesday 9:00am slot → creates a **PublishingJob**.
2. For X variants:
   - Creator selects 2, clicks “Auto-distribute this week”:
     - Kairo auto-assigns them to 2 different days/times with reasonable spacing.
3. Calendar now shows:
   - 1 LinkedIn post,
   - 2 X posts,
   - Each with colored tags for persona/pillar.

We do **not** actually call LinkedIn/X APIs in the demo – just update UI state and backing fake data.

---

### 4.4 End of Week – “Did this actually work?”

**Entry screen**: `Analytics` view for the brand.

#### 4.4.1 What the user sees

- A **summary** panel:
  - Posts published this week (count, by channel),
  - Top performing persona/pillar combinations,
  - Top 2–3 **PatternTemplates** by engagement.

- A **table of posts**:
  - Each row = ContentVariant + metrics:
    - Impressions,
    - Engagement rate,
    - Clicks (fake, but realistic numbers),
    - Pattern / Persona / Pillar tags.

- A small **“What Kairo learned”** section:
  - e.g. “Confessional pattern performed 1.4× vs baseline with Data-driven CMOs this week.”
  - “Listicle pattern underperformed on X; reduced its weight for next week.”

- The **Assistant**, anchored to analytics context:
  - It can see PatternUsage, FeedbackEvents, BrandPreferences.

#### 4.4.2 Actions taken

In the hero walk:

1. Manager asks the Assistant:
   - “Explain why these two posts did well and what we should do more of next week.”
2. Assistant replies with:
   - A comparison of patterns,
   - Concrete suggestions (“lean more on confessional + tactical pattern for CMOs”).

3. Manager marks:
   - One variant as **“Saved as example”** → creates a BrandMemoryFragment.
   - One pattern as **“Too clickbaity”** → triggers a `FeedbackEvent` that slightly reduces its weight.

Even though this is all fake, the UI must **visibly reflect Learning**:

- Somewhere in the UI (even a small banner), we show:
  - “Adjusted LinkedIn pattern weights based on this week’s results.”
- Next time we view Opportunities or CE (still within the hero demo), some UI copy hints that:
  - certain patterns / angles are now more likely.

---

## 5. Assistant Behavior Across the Week

The **Assistant** is central to the “copilot” feel. In the hero demo it must:

- Always know the **current brand**.
- Know the **screen context**:
  - On Today: it sees OpportunityBatch + selected OpportunityCard(s).
  - On Package: it sees ContentPackage, CoreArgument, ChannelPlans, selected ContentVariant.
  - On Analytics: it sees PatternUsage, ContentVariants, faux metrics.

We should **script** a few specific example prompts per screen:

- Today:
  - “Which 3 opportunities matter most for CMOs this week?”
- Package:
  - “Make this hook more concrete without changing the core argument.”
  - “Rewrite this post targeting RevOps instead of CMOs.”
- Analytics:
  - “Why did this pattern work better on LinkedIn than X this week?”

The UI doesn’t need a full conversation log system in the demo, but it should look **plausible** enough that adding persistence later is straightforward.

---

## 6. Non-Goals for the Hero Demo

For this first hero UI, we **explicitly do NOT** need to:

- Show onboarding flows (questionnaires, example import).
- Implement multi-brand switching deeply (one hero brand is enough, others can be stubbed out).
- Support more than LinkedIn + X in detail (YouTube/TikTok can appear as “coming soon”).
- Build real auth; a simple “pretend we’re logged in as this user” is fine.
- Wire to real backends or scraping; everything can be local JSON / fake APIs.

The goal is **clarity and richness of the core loop**, not breadth.

---

## 7. What This Implies for the UI Work

This narrative will drive:

- The **route map** (`02-routes-and-screens.md`):
  - We can derive required screens directly from this week story.
- The **fake data contracts**:
  - We know exactly which canonical objects and fields the UI must show.
- The **design system**:
  - We know which components we need to render this story cleanly (boards, cards, calendar, assistant drawer, etc.).

When we open the UI repo and talk to Claude Code, we should be able to say:

> “Implement the hero week for `Northshore Analytics` exactly as described in `01-hero-week-narrative.md`, using the routes and types in the other docs. No extra features, no improvisation.”

This document is the **north star for the demo**. If something isn’t in here (or conflicts with it), it doesn’t belong in the hero UI yet.