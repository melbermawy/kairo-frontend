# 05 – fake data & stubs (hero demo)

goal: make the **kairo hero demo** feel like a real, mature product, while everything is driven by **fake data + stubbed apis**.

this doc defines:

- which scenarios must “just work” in the demo,
- which canonical objects (CO-xx) we pre-generate,
- how front-end talks to stubs (shapes, endpoints, behaviors),
- how we later swap stubs for real backend with minimal UI changes.

---

## 1. demo goals & scenarios

the hero demo should convincingly show a week-in-the-life for a strategist/creator.

**scenarios we must support end-to-end in demo:**

1. **switch brand**
   - see **BrandSwitcher** with 2–3 realistic brands.
   - switching brand swaps all data (opportunities, packages, patterns, analytics).

2. **scan “today’s opportunities”**
   - “today” board shows:
     - mix of trend / evergreen / competitive **OpportunityCards (CO-09)**.
     - each card shows persona, pillar, score, and 1–2 source snippets.
   - hovering / clicking opens detail drawer.

3. **spin up a content package from an opportunity**
   - click “open in workspace” from an OpportunityCard.
   - land in **Content Workspace** with a new **ContentPackage (CO-14)**.
   - see:
     - core argument,
     - channel plan (linkedin + x),
     - pattern info,
     - 2–3 **ContentVariants (CO-17)** per channel.

4. **edit, approve, and schedule a variant**
   - edit text in variant editor.
   - mark variant as “approved”.
   - click “schedule” → create **PublishingJob (CO-22)** with fake future datetime.
   - job appears in a mini calendar / list with status “scheduled”.

5. **give feedback to the system**
   - rate variant (1–5) → creates **FeedbackEvent (CO-18)**.
   - mark “save as example” → creates **BrandMemoryFragment (CO-07)**.
   - mark “never again” on a pattern.
   - for demo, these actions:
     - immediately update **BrandPreferences (CO-19)** in memory (weights, tone bias),
     - show visible confirmation (to prove learning exists).

6. **see pattern & performance insight**
   - pattern library view:
     - list of **PatternTemplate (CO-12)** with usage and simple metrics.
   - small analytics card:
     - “confessional story on linkedin → avg +X% engagement vs baseline”.

7. **use global chat**
   - open global chat drawer.
   - chat has:
     - brand already in context,
     - awareness of currently selected opportunity/package/variant.
   - demo: chat answers come from stubbed llm responses (pre-canned but context-aware enough to feel real).

**hard rule**: demo should feel **stateful** within a session. edits, ratings, and schedules should update ui and in-memory data, even if nothing is persisted to a real db.

---

## 2. demo brands & fixtures

we’ll seed **2–3 brands** with fully populated objects.

### 2.1 brands

**brand a – “acme analytics” (b2b)**

- space: b2b saas / marketing analytics.
- tone: direct, analytical, supportive.
- primary channels: linkedin, x.

**brand b – “shoreline studio” (b2c / creator)**

- space: independent video creator / creative studio.
- tone: story-driven, playful, honest.
- primary channels: x, youtube shorts.

**(optional) brand c – “mediscribe” (regulated / healthcare-lite)**

- for future: shows risk modes + safety behaviors.
- can be stubbier in v1 of the demo.

### 2.2 object counts (per brand)

rough target per brand (for realism, not minimalism):

- `Brand (CO-01)`: 1  
- `Personas (CO-02)`: 3–4  
- `Pillars (CO-03)`: 4–5  
- `BrandBrainSnapshot (CO-05)`: 2 versions (old + current)  
- `BrandRuntimeContext (CO-06)`: 1 current  
- `BrandMemoryFragment (CO-07)`: ~25–40  
- `GlobalSourceDoc (CO-08)`: ~15–25  
- `OpportunityCard (CO-09)`:
  - today: 6–10
  - this week total: ~20–30  
- `OpportunityBatch (CO-10)`: 3–5 recent days  
- `PatternSourcePost (CO-11)`: ~20 (mix internal hits + model accounts)  
- `PatternTemplate (CO-12)`: 6–10  
- `PatternUsage (CO-13)`: ~40–80  
- `ContentPackage (CO-14)`:
  - open (draft/in_review): 5–8
  - historical (published): 10–15  
- `CoreArgument (CO-15)`: one per content package  
- `ChannelPlan (CO-16)`: 1–3 per package  
- `ContentVariant (CO-17)`: 3–8 per channel plan  
- `FeedbackEvent (CO-18)`: ~50 (mixture of ratings, save-as-example, never-again)  
- `BrandPreferences (CO-19)`: 1  
- `GlobalPriors (CO-20)`: 1 (global across brands)  
- `ChannelConfig (CO-21)`: 2–3 per brand (linkedin, x, maybe youtube)  
- `PublishingJob (CO-22)`:
  - scheduled: 3–5
  - completed: ~10 (for analytics views)

we do **not** need real social ids; internal ids (e.g. `opp_501`) are enough.

---

## 3. stub architecture

for the hero demo, ui will talk to a **local stub api layer** rather than real django.

### 3.1 high-level

- front-end calls a **typescript stub client** that implements the same interface we’ll later use for the real backend.
- stub client:
  - reads from static fixture json files on load,
  - keeps an in-memory “store” for the session,
  - simulates latency and async behavior.

### 3.2 module layout (ui repo)

```text
/src
  /demo
    fixtures/
      brands.json
      personas.json
      pillars.json
      brand_brain_snapshots.json
      ...
    stubStore.ts           // in-memory state manager
    stubApiClient.ts       // implements ApiClient interface via stubStore
    fakeLlm.ts             // canned chat + “generated” content responses
  api/
    client.ts              // exports ApiClient; in demo it re-exports stubApiClient
  config/
    demoMode.ts            // flag to switch mode later


⸻

4. stubbed behaviors by object

we don’t need to list every endpoint here; just the critical flows and behaviors.

4.1 brands, personas, pillars
	•	GET /brands
	•	returns all demo brands (subset from brands.json).
	•	GET /brands/:id/personas
	•	GET /brands/:id/pillars

behavior
	•	pure read; no writes in demo.
	•	selecting brand updates currentBrandId in stubStore.

4.2 opportunities
	•	GET /brands/:id/opportunities?scope=today
	•	returns OpportunityBatch (CO-10) for “today” + its cards.
	•	stub store pre-picks a “today” date (e.g. 2025-02-01).
	•	GET /opportunities/:id
	•	returns OpportunityCard (CO-09) with hydrated GlobalSourceDoc (CO-08) snippets.
	•	POST /opportunities/:id/actions
	•	actions accepted:
	•	pin, snooze, ignore.
	•	stub behavior:
	•	update local card attributes (pinned, ignored, etc.).
	•	optionally log a FeedbackEvent (CO-18) of type opportunity_action.

4.3 content packages & variants
	•	POST /content-packages
	•	body: { opportunityId } or { manualTopic }.
	•	stub behavior:
	•	look up OpportunityCard.
	•	pick a persona, pillar, PatternTemplate based on simple rules.
	•	generate a new ContentPackage (CO-14), CoreArgument (CO-15), ChannelPlan (CO-16), and several ContentVariant (CO-17) instances from fixtures or via fakeLlm.
	•	insert into store and return hydrated package.
	•	GET /content-packages/:id
	•	return full package with nested core argument, plans, variants.
	•	PATCH /content-variants/:id
	•	allow:
	•	updating body,
	•	updating status (draft → edited → approved).
	•	stub just mutates in-memory object.

4.4 scheduling / publishing
	•	POST /publishing-jobs
	•	input: { contentVariantId, scheduledAt }.
	•	stub:
	•	create PublishingJob (CO-22) with status = "pending".
	•	simulate state change to "scheduled" after short timeout.
	•	GET /publishing-jobs?brandId=...
	•	return scheduled + historical jobs for calendar / list view.

no actual network calls to linkedin/x in demo.

4.5 feedback & learning
	•	POST /feedback-events
	•	payload includes:
	•	feedback_type (variant_rating, save_as_example, never_again, etc.)
	•	references (variant id, pattern id, opportunity id).
	•	stub:
	•	append FeedbackEvent (CO-18) to store,
	•	immediately update BrandPreferences (CO-19):
	•	pattern_weights,
	•	tone_bias_overrides,
	•	maybe persona_pillar_bias.
	•	GET /brands/:id/preferences
	•	returns current BrandPreferences (CO-19).

this makes learning visibly real in the demo:
	•	user marks pattern as “never again” → weight drops → later recommendations in the same session show decreased use.

4.6 patterns
	•	GET /brands/:id/pattern-templates
	•	returns list of PatternTemplate (CO-12) with usage stats from PatternUsage (CO-13).
	•	GET /patterns/usage?brandId=...
	•	returns aggregated metrics for analytics panel.

no creation / editing in demo; they are seeded.

4.7 global chat
	•	POST /chat
	•	payload:
	•	brandId
	•	optional opportunityId, contentPackageId, contentVariantId
	•	message.
	•	behavior in fakeLlm.ts:
	•	inspect context:
	•	if variant id present → respond like “editor” giving notes.
	•	if opportunity id present → respond like strategist proposing angles.
	•	else → respond with generic but on-brand suggestions using BrandBrainSnapshot (CO-05) + random BrandMemoryFragment (CO-07).
	•	responses chosen from a small set of pre-written templates with interpolated data (persona, pillar, opportunity angle, etc.).

no real llm calls in demo; all responses deterministic per input pattern.

⸻

5. fake data principles
	1.	everything must be internally consistent
	•	opportunities must reference real personas/pillars/source docs.
	•	content packages must reference real opportunities and brand brain snapshots.
	•	feedback events must reference real variants/patterns.
	2.	realistic but not overwhelming
	•	enough cards/variants to scroll, but not hundreds.
	•	small differences in scores, dates, engagement metrics so charts and lists look non-random.
	3.	safe content
	•	no real companies or people.
	•	invented brands, competitors, and metrics.
	•	no political/religious/medical claims that would be awkward in a demo.
	4.	deterministic seeding
	•	fixtures should be static json so the demo looks identical each time it loads.
	•	stateful actions change only in memory; reload resets to baseline.

⸻

6. swapping stubs for real backend later

we want the hero demo wiring to survive real backend adoption.

rules:
	1.	single ApiClient interface
	•	/src/api/client.ts exports an object with methods:
	•	getBrands, getOpportunities, createContentPackage, etc.
	•	stub client implements it now; real client will implement the same shape later.
	2.	no direct fixture imports in ui components
	•	components never read fixtures/*.json directly.
	•	they only talk to the ApiClient.
	3.	demo mode flag
	•	config/demoMode.ts exposes a boolean.
	•	when false, ApiClient will call real django endpoints.
	4.	schema alignment
	•	stub types should match canonical objects (CO-01..CO-22).
	•	django serializers should be built from the same types later.

⸻

7. minimal tasks to get demo working

when we jump into ui work, “done enough” for hero demo means:
	1.	create fixture jsons for:
	•	brands, personas, pillars, brand brain snapshots,
	•	opportunities + batches + source docs,
	•	pattern templates + usage,
	•	content packages + variants,
	•	brand preferences, feedback, publishing jobs.
	2.	implement stubStore.ts with:
	•	in-memory state and simple update helpers.
	3.	implement stubApiClient.ts with:
	•	methods backing the flows listed in sections 3–4.
	4.	implement fakeLlm.ts with:
	•	a few canned chat responses & “generation” functions.

after that, the ui can be built as if it were talking to a real backend.

