# PR-C: Opportunity Drawer — Evidence-Backed Workspace

## Overview

This PR transforms the opportunity drawer from a simple tooltip panel into a full-fledged evidence workspace. The drawer now surfaces provenance clearly, supports platform filtering, and provides distinct desktop/mobile experiences.

## UX Behavior

### Desktop (≥768px)

- **Right-side sheet** fixed at 560px width
- Slides in from right with spring animation
- Independent scroll within drawer content
- Backdrop click or Escape key closes
- Focus trapped within drawer when open

### Mobile (<768px)

- **Bottom sheet** with snap points:
  - `collapsed`: 35% viewport height
  - `half`: 55% viewport height (default on open)
  - `full`: 92% viewport height
- Drag handle at top for swipe gestures
- Swipe down to collapse/close, swipe up to expand
- Body scroll locked when drawer is open

### Drawer Content Structure

1. **Header** (sticky)
   - Score badge (color-coded by score tier)
   - Type tag (trend/evergreen/competitive)
   - Lifecycle badge with sparkline
   - Title
   - Close button

2. **Why Now** section
   - Summary (bold, high contrast)
   - Bullet list of reasons

3. **Trend Signal** (if applicable)
   - Audio/hashtag/phrase indicator
   - Signal value

4. **Brand Fit**
   - Pillar badge
   - Persona
   - Voice reason quote

5. **Evidence** section
   - Platform filter badges (with counts)
   - Filterable evidence list
   - Expandable evidence tiles with:
     - Thumbnail/platform icon
     - Caption snippet
     - Author, timestamp, format
     - Metrics (views, likes, comments, shares)
     - Full details on expand
     - "Open source" external link

6. **Footer CTA** (sticky)
   - "Generate Package" button
   - Links to packages page

## URL State Contract

The drawer state is synced to the URL for shareability and deep linking.

### Query Parameter

```
?opp=<opportunity_id>
```

### Behavior

| Action | URL Change |
|--------|------------|
| Click opportunity card | Add `?opp=opp_001` |
| Click platform badge on card | Add `?opp=opp_001` + set platform filter |
| Close drawer (click backdrop, Escape, close button) | Remove `?opp=` param |
| Page load with `?opp=opp_001` | Open drawer to that opportunity |

### Implementation

- Uses Next.js `useRouter` and `useSearchParams`
- `router.replace()` for URL updates (no history pollution)
- Effect hook checks URL on mount and opens drawer if `opp` param exists

## Component Map

### New Files

| File | Description |
|------|-------------|
| `src/components/opportunities/PlatformBadgesRow.tsx` | Platform filter badges with counts |
| `src/components/opportunities/EvidenceList.tsx` | Filterable evidence list container |
| `src/components/opportunities/EvidenceTileExpanded.tsx` | Expandable evidence tile with full details |
| `src/components/opportunities/__tests__/opportunityDrawer.test.ts` | Test suite for drawer behavior |
| `ui/docs/pr_c_opportunity_drawer.md` | This documentation |

### Modified Files

| File | Changes |
|------|---------|
| `src/components/opportunities/OpportunityDrawer.tsx` | Complete redesign with desktop/mobile behaviors, evidence workspace |
| `src/components/opportunities/OpportunityCardV2.tsx` | Platform badges with counts, `onPlatformClick` callback |
| `src/components/opportunities/index.ts` | Export new components |
| `src/app/brands/[brandId]/today/TodayBoardClient.tsx` | URL state sync, platform filter handling, dark token cleanup |

## Accessibility

- **Focus trap**: Close button receives focus when drawer opens
- **Keyboard navigation**: Escape key closes drawer, Tab cycles within
- **ARIA attributes**:
  - `role="dialog"` on drawer container
  - `aria-modal="true"` for modal behavior
  - `aria-labelledby="drawer-title"` references title
  - `aria-label` on close button and interactive elements
  - `aria-pressed` on filter toggle buttons
  - `aria-expanded` on expandable tiles
- **Visible focus states**: Uses `focus-visible:ring-2` pattern

## Token Compliance

All components use semantic Kairo design tokens:

- **Surfaces**: `bg-kairo-bg-panel`, `bg-kairo-bg-card`, `bg-kairo-bg-elevated`
- **Text**: `text-kairo-fg`, `text-kairo-fg-muted`, `text-kairo-fg-subtle`
- **Borders**: `border-kairo-border-subtle`, `border-kairo-border-strong`
- **Accent**: `kairo-accent-*` scale for interactive elements
- **Score/Lifecycle**: Semantic score and lifecycle tokens

No hardcoded hex colors (except platform brand colors for badges).

## Acceptance Checklist

- [x] Opportunity card shows platform badges with evidence counts
- [x] Clicking platform badge opens drawer pre-filtered to that platform
- [x] Desktop drawer: right-side sheet, 560px width, independent scroll
- [x] Mobile drawer: bottom sheet with snap points (35%/55%/92%)
- [x] Mobile drawer supports swipe/drag gestures
- [x] Escape key closes drawer
- [x] Backdrop click closes drawer
- [x] Focus trapped in drawer when open
- [x] Body scroll locked when drawer open
- [x] URL `?opp=<id>` reflects drawer state
- [x] Page load with `?opp=<id>` opens drawer
- [x] Evidence list filterable by platform
- [x] Evidence tiles expandable with full caption + metrics
- [x] "Open source" link on evidence tiles
- [x] Sticky footer with "Generate Package" CTA
- [x] All tokens semantic (no hardcoded colors)
- [x] Tests pass
- [x] Build passes
