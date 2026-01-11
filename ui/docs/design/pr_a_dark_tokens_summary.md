# PR-A: Dark Base + Token Completion

## Summary

This PR implements a dark-first design system for Kairo, replacing the previous light aqua-based theme with a modern dark theme using warm neutrals and indigo accent colors.

## Changes Overview

### 1. Token System (`globals.css`)

Complete dark-first token system with:

#### Core Semantic Surfaces
- `--kairo-color-bg-app`: #18181B (zinc-900) - Main app background
- `--kairo-color-bg-panel`: #1F1F23 - Sidebar/panel background
- `--kairo-color-bg-card`: #27272A (zinc-800) - Card surfaces
- `--kairo-color-bg-elevated`: #3F3F46 (zinc-700) - Elevated elements
- `--kairo-color-bg-hover`: #3F3F46 - Hover states

#### Foreground Tokens
- `--kairo-color-fg`: #FAFAFA (zinc-50) - Primary text
- `--kairo-color-fg-muted`: #A1A1AA (zinc-400) - Secondary text
- `--kairo-color-fg-subtle`: #71717A (zinc-500) - Tertiary text

#### Accent Scale (Indigo-based, replaces Aqua)
- 50: #EEF2FF through 950: #1E1B4B
- Primary accent: 500 (#6366F1), 600 (#4F46E5)
- Accent foreground colors for dark backgrounds

#### Lifecycle Tokens (RGBA for dark mode)
- Seed: emerald (#10B981) at 15% opacity bg, #34D399 fg
- Rising: amber (#F59E0B) at 15% opacity bg, #FBBF24 fg
- Peaking: rose (#F43F5E) at 15% opacity bg, #FB7185 fg
- Declining: zinc at 10% opacity bg, #A1A1AA fg
- Evergreen: indigo at 15% opacity bg, #A5B4FC fg
- Active: blue at 15% opacity bg, #60A5FA fg

#### Chart Tokens
- Positive: #34D399 (emerald-400)
- Negative: #F87171 (red-400)

#### Platform Tokens
- TikTok: #000000
- X: #000000
- LinkedIn: #0A66C2
- Reddit: #FF4500
- Instagram: gradient (CSS custom property)
- Web: #3F3F46

#### Score Tokens
- High (80+): emerald-based
- Medium (70-79): indigo-based
- Low (<70): zinc-based

### 2. Component Updates

#### OpportunityCardV2.tsx & OpportunityDrawer.tsx
- Replaced hardcoded Tailwind lifecycle colors with tokenized classes
- `bg-emerald-100` → `bg-kairo-lifecycle-seed-bg`
- `text-emerald-700` → `text-kairo-lifecycle-seed-fg`
- Same pattern for rising, peaking, declining, evergreen, active
- Score pills now use `bg-kairo-score-high-bg` etc.

#### Sparkline.tsx
- Chart colors now use CSS variables
- `#10B981` → `var(--kairo-color-chart-positive)`
- `#EF4444` → `var(--kairo-color-chart-negative)`

#### PlatformIcon.tsx
- Platform badge colors now use tokens
- `bg-[#0A66C2]` → `bg-kairo-platform-linkedin`
- Instagram uses utility class `kairo-instagram-gradient`

#### PackageRow.tsx
- Removed inline hex values for hover states
- Uses semantic tokens for hover colors

#### BrandSidebar.tsx
- Updated background to `bg-kairo-bg-panel`
- Glass effects tuned for dark mode (reduced white opacity)
- Focus rings use `kairo-accent-500`
- Text colors use `kairo-fg` and `kairo-fg-muted`

#### TopBar.tsx
- Background changed from `bg-kairo-aqua-500` to `bg-kairo-accent-600`
- Focus ring offsets updated

### 3. Test Coverage

Added `hardcodedColors.test.ts` to detect:
- Hardcoded hex values in Tailwind classes
- Raw Tailwind color scales (emerald-*, orange-*, etc.)
- Inline SVG color attributes

## Migration Notes

### Legacy Token Mapping

The following legacy tokens are maintained for backward compatibility:
- `kairo-aqua-*` → maps to `kairo-accent-*`
- `kairo-sand-*` → maps to zinc scale
- `kairo-ink-*` → maps to zinc scale
- `kairo-surface-plain` → maps to `kairo-bg-card`
- `kairo-surface-soft` → maps to `kairo-bg-elevated`

### Breaking Changes

None - all existing token references continue to work via legacy mappings.

## Files Changed

1. `src/app/globals.css` - Complete token system overhaul
2. `src/components/opportunities/OpportunityCardV2.tsx` - Lifecycle + score tokens
3. `src/components/opportunities/OpportunityDrawer.tsx` - Lifecycle + score tokens
4. `src/components/opportunities/Sparkline.tsx` - Chart color tokens
5. `src/components/opportunities/PlatformIcon.tsx` - Platform color tokens
6. `src/components/packages/PackageRow.tsx` - Hover state tokens
7. `src/components/layout/BrandSidebar.tsx` - Dark mode glass effects
8. `src/components/layout/TopBar.tsx` - Accent color header
9. `src/lib/__tests__/hardcodedColors.test.ts` - New test file

## Testing

- Build: PASS
- Tests: 32/32 passing
- Hardcoded color detection: PASS (0 violations)
