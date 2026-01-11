# Kairo Design Token Audit

> Generated: 2025-12-29
> Purpose: Prepare for dark-mode redesign via tokens (not component-by-component)

---

## 1. Token System Overview

### Token Location
All design tokens are defined in a single file:
- **`src/app/globals.css`** - CSS custom properties in `:root` + Tailwind v4 `@theme inline` block

### Architecture
```
:root {
  --kairo-color-*      → Raw color values
  --kairo-font-*       → Typography tokens
  --kairo-radius-*     → Border radius tokens
  --kairo-shadow-*     → Shadow tokens
  --kairo-motion-*     → Animation timing tokens
  --kairo-ease-*       → Easing functions
}

@theme inline {
  --color-kairo-*      → Tailwind color utilities (maps to :root vars)
  --shadow-*           → Tailwind shadow utilities
  --radius-*           → Tailwind radius utilities
  --font-*             → Tailwind font utilities
}
```

---

## 2. Current Tokens

### A. Color Tokens

#### Aqua (Primary Brand)
| Token | Value | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| `--kairo-color-aqua-50` | `#F2F2F2` | `bg-kairo-aqua-50` | Light backgrounds, hover states |
| `--kairo-color-aqua-100` | `#E8F5F5` | `bg-kairo-aqua-100` | Subtle tinted backgrounds |
| `--kairo-color-aqua-200` | `#D0EDED` | `border-kairo-aqua-200` | Border accents |
| `--kairo-color-aqua-300` | `#A8DCDC` | `text-kairo-aqua-300` | Light accent |
| `--kairo-color-aqua-500` | `#84CCCC` | `bg-kairo-aqua-500` | Primary buttons, CTAs |
| `--kairo-color-aqua-600` | `#3D8080` | `text-kairo-aqua-600` | Text/links (readable) |
| `--kairo-color-aqua-700` | `#2D6666` | `text-kairo-aqua-700` | Darker hover/pressed text |

#### Ink (Text)
| Token | Value | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| `--kairo-color-ink-900` | `#152023` | `text-kairo-ink-900` | Headings |
| `--kairo-color-ink-700` | `#374247` | `text-kairo-ink-700` | Primary body text |
| `--kairo-color-ink-600` | `#4A5459` | `text-kairo-ink-600` | Nav hover text |
| `--kairo-color-ink-500` | `#6B757A` | `text-kairo-ink-500` | Secondary text/labels |
| `--kairo-color-ink-400` | `#8A9499` | `text-kairo-ink-400` | Nav icons default |
| `--kairo-color-ink-300` | `#AAB3B7` | `text-kairo-ink-300` | Muted meta/dividers |

#### Sand (Deprecated - Maps to Aqua)
| Token | Value | Notes |
|-------|-------|-------|
| `--kairo-color-sand-25` | `#F2F2F2` | Deprecated, use `aqua-50` |
| `--kairo-color-sand-50` | `#F2F2F2` | Deprecated, use `aqua-50` |
| `--kairo-color-sand-75` | `#E8F5F5` | Deprecated, use `aqua-100` |
| `--kairo-color-sand-100` | `#E8F5F5` | Deprecated, use `aqua-100` |
| `--kairo-color-sand-200` | `#D0EDED` | Deprecated, use `aqua-200` |

#### Surfaces & Borders
| Token | Value | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| `--kairo-color-surface-plain` | `#FFFFFF` | `bg-kairo-surface-plain` | Cards, modals |
| `--kairo-color-surface-soft` | `#FAFAFA` | `bg-kairo-surface-soft` | Soft backgrounds |
| `--kairo-color-border-subtle` | `#E0E0E0` | `border-kairo-border-subtle` | Default borders |
| `--kairo-color-border-strong` | `#CCCCCC` | `border-kairo-border-strong` | Emphasis borders |

#### Semantic Tags
| Token | Value | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| `--kairo-color-tag-trend-bg` | `#F2F2F2` | `bg-kairo-tag-trend-bg` | Trend tags |
| `--kairo-color-tag-trend-fg` | `#3D8080` | `text-kairo-tag-trend-fg` | Trend tag text |
| `--kairo-color-tag-evergreen-bg` | `#E7F7EB` | `bg-kairo-tag-evergreen-bg` | Evergreen tags |
| `--kairo-color-tag-evergreen-fg` | `#1D8A47` | `text-kairo-tag-evergreen-fg` | Evergreen tag text |
| `--kairo-color-tag-competitive-bg` | `#FFF3E0` | `bg-kairo-tag-competitive-bg` | Competitive tags |
| `--kairo-color-tag-competitive-fg` | `#C76A1F` | `text-kairo-tag-competitive-fg` | Competitive tag text |
| `--kairo-color-tag-campaign-bg` | `#F3E8FF` | `bg-kairo-tag-campaign-bg` | Campaign tags |
| `--kairo-color-tag-campaign-fg` | `#6B21A8` | `text-kairo-tag-campaign-fg` | Campaign tag text |
| `--kairo-color-tag-low-score-bg` | `#FDEBEC` | `bg-kairo-tag-low-score-bg` | Low score/danger tags |
| `--kairo-color-tag-low-score-fg` | `#C0343C` | `text-kairo-tag-low-score-fg` | Low score/danger text |

#### Action Colors
| Token | Value | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| `--kairo-color-action-primary-bg` | `var(--kairo-color-aqua-500)` | `bg-kairo-action-primary-bg` | Primary buttons |
| `--kairo-color-action-primary-fg` | `#FFFFFF` | `text-kairo-action-primary-fg` | Primary button text |
| `--kairo-color-action-primary-hover-bg` | `#6BBCBC` | `hover:bg-kairo-action-primary-hover-bg` | Primary hover |
| `--kairo-color-action-muted-bg` | `#FFFFFF` | `bg-kairo-action-muted-bg` | Secondary buttons |
| `--kairo-color-action-muted-border` | `var(--kairo-color-border-subtle)` | `border-kairo-action-muted-border` | Secondary border |
| `--kairo-color-action-muted-fg` | `var(--kairo-color-ink-700)` | `text-kairo-action-muted-fg` | Secondary text |

### B. Typography Tokens
| Token | Value | Usage |
|-------|-------|-------|
| `--kairo-font-family-sans` | Lato, system-ui, ... | Body text |
| `--kairo-font-size-xs` | `11px` | Meta labels, pills |
| `--kairo-font-size-sm` | `13px` | Secondary text |
| `--kairo-font-size-md` | `15px` | Main body |
| `--kairo-font-size-lg` | `18px` | Section headings |
| `--kairo-font-size-xl` | `22px` | Page titles |
| `--kairo-font-size-2xl` | `28px` | Hero (rare) |
| `--kairo-font-weight-regular` | `400` | Body |
| `--kairo-font-weight-medium` | `500` | Emphasis |
| `--kairo-font-weight-semibold` | `600` | Headings |
| `--kairo-line-height-tight` | `1.2` | Headings |
| `--kairo-line-height-normal` | `1.4` | Body |
| `--kairo-line-height-relaxed` | `1.6` | Paragraphs |

### C. Radius Tokens
| Token | Value | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| `--kairo-radius-xs` | `4px` | `rounded-xs` | Small elements |
| `--kairo-radius-sm` | `6px` | `rounded-sm` | Buttons |
| `--kairo-radius-md` | `10px` | `rounded-(--kairo-radius-md)` | Cards |
| `--kairo-radius-lg` | `16px` | `rounded-lg` | Large containers |
| `--kairo-radius-pill` | `999px` | `rounded-(--kairo-radius-pill)` | Tags, pill buttons |

### D. Shadow Tokens
| Token | Value | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| `--kairo-shadow-none` | `none` | `shadow-none` | Flat elements |
| `--kairo-shadow-soft` | `0 6px 18px rgba(12, 48, 66, 0.04)` | `shadow-soft` | Cards, hover |
| `--kairo-shadow-elevated` | `0 12px 30px rgba(12, 48, 66, 0.08)` | `shadow-elevated` | Modals, dropdowns |

### E. Motion Tokens
| Token | Value | Usage |
|-------|-------|-------|
| `--kairo-motion-fast` | `120ms` | Micro-interactions |
| `--kairo-motion-medium` | `200ms` | Standard transitions |
| `--kairo-motion-slow` | `280ms` | Page transitions |
| `--kairo-ease-standard` | `cubic-bezier(0.4, 0.0, 0.2, 1)` | Default easing |
| `--kairo-ease-soft` | `cubic-bezier(0.33, 0.0, 0.2, 1)` | Gentle easing |

---

## 3. Hardcoded Colors (Gaps)

### Critical: Lifecycle Badge Colors (No Tokens)
These are duplicated in two files and use raw Tailwind colors:

| Color | Files | Lines |
|-------|-------|-------|
| `bg-emerald-100 text-emerald-700` | `OpportunityCardV2.tsx`, `OpportunityDrawer.tsx` | 20, 23, 87, 120 |
| `bg-orange-100 text-orange-700` | `OpportunityCardV2.tsx`, `OpportunityDrawer.tsx` | 21, 24 |
| `bg-red-100 text-red-700` | `OpportunityCardV2.tsx`, `OpportunityDrawer.tsx` | 22, 25 |
| `bg-gray-100 text-gray-600` | `OpportunityCardV2.tsx`, `OpportunityDrawer.tsx` | 23, 26 |
| `bg-blue-100 text-blue-700` | `OpportunityCardV2.tsx`, `OpportunityDrawer.tsx` | 25, 28 |

**Recommendation:** Add lifecycle tokens:
```css
--kairo-color-lifecycle-seed-bg: #D1FAE5;
--kairo-color-lifecycle-seed-fg: #047857;
--kairo-color-lifecycle-rising-bg: #FFEDD5;
--kairo-color-lifecycle-rising-fg: #C2410C;
--kairo-color-lifecycle-peaking-bg: #FEE2E2;
--kairo-color-lifecycle-peaking-fg: #DC2626;
--kairo-color-lifecycle-declining-bg: #F3F4F6;
--kairo-color-lifecycle-declining-fg: #4B5563;
--kairo-color-lifecycle-active-bg: #DBEAFE;
--kairo-color-lifecycle-active-fg: #1D4ED8;
```

### Critical: Platform Badge Colors (No Tokens)
**File:** `src/components/opportunities/PlatformIcon.tsx:103-107`
| Color | Platform |
|-------|----------|
| `bg-black text-white` | TikTok, X |
| `bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400` | Instagram |
| `bg-[#0A66C2] text-white` | LinkedIn |
| `bg-[#FF4500] text-white` | Reddit |

**Recommendation:** Platform colors are brand-specific; may keep hardcoded or add:
```css
--kairo-color-platform-tiktok: #000000;
--kairo-color-platform-instagram: linear-gradient(...);
--kairo-color-platform-x: #000000;
--kairo-color-platform-linkedin: #0A66C2;
--kairo-color-platform-reddit: #FF4500;
```

### Critical: Sparkline Colors (No Tokens)
**File:** `src/components/opportunities/Sparkline.tsx:70-100`
| Color | Usage |
|-------|-------|
| `#10B981` | Uptrend (emerald-500) |
| `#EF4444` | Downtrend (red-500) |

**Recommendation:** Add chart tokens:
```css
--kairo-color-chart-positive: #10B981;
--kairo-color-chart-negative: #EF4444;
```

### Medium: Inline Hex in Components
| File | Line | Color | Context |
|------|------|-------|---------|
| `PackageRow.tsx` | 113 | `#F2F2F2`, `#3D8080`, `#84CCCC` | Hover states (should use tokens) |

### Medium: White/Black Usage
These may be intentional (overlays, modals) but need review for dark mode:

| Pattern | Files | Context |
|---------|-------|---------|
| `bg-black/30`, `bg-black/50` | AppShell, EvidenceTile, OpportunityDrawer | Overlays, backdrops |
| `bg-white/10`, `bg-white/20`, `bg-white/30` | TopBar, BrandSidebar | Glass effects on dark header |
| `text-white`, `text-white/70`, `text-white/90` | TopBar, ChatInput | Text on aqua/dark backgrounds |

### Medium: Custom Shadow Values
| File | Line | Value |
|------|------|-------|
| `BrandSidebar.tsx` | 167, 172, 176 | Complex inset shadows with `rgba` |
| `TopBar.tsx` | 106 | `shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]` |

### Low: Focus Ring Color
**File:** `src/app/globals.css:219`
```css
:focus-visible {
  outline: 2px solid #84CCCC; /* Should use var(--kairo-color-aqua-500) */
}
```

### Low: Selection Color
**File:** `src/app/globals.css:225-227`
```css
::selection {
  background-color: #D0EDED; /* Should use var(--kairo-color-aqua-200) */
  color: #2D6666;            /* Should use var(--kairo-color-aqua-700) */
}
```

---

## 4. Dark Mode Status

### Current State: **No dark mode support**

- No `dark:` variants in any component
- No `.dark` class handling
- No `prefers-color-scheme` media query
- No theme toggle or context

### Recommendation for Dark Mode

1. **Define dark mode values in `:root`** using CSS custom properties that can be swapped:
   ```css
   :root {
     --kairo-color-surface-plain: #FFFFFF;
   }

   :root.dark {
     --kairo-color-surface-plain: #1A1A1A;
   }
   ```

2. **Or use Tailwind's dark mode** with class strategy:
   ```js
   // next.config.js or tailwind.config
   darkMode: 'class'
   ```

3. **Semantic tokens are already in place** - the gap is only:
   - Adding dark variants to `:root`
   - Fixing hardcoded colors listed above
   - Adding a theme toggle mechanism

---

## 5. Files Using Tokens (Good)

These files properly use the token system:

| Component | Token Coverage |
|-----------|----------------|
| `KButton.tsx` | 100% tokenized |
| `KCard.tsx` | 100% tokenized |
| `KTag.tsx` | 100% tokenized |
| `TodayFocusStrip.tsx` | 100% tokenized |
| `OpportunityCard.tsx` | 100% tokenized |
| `PatternRow.tsx` | 100% tokenized |
| `PackagesTable.tsx` | 100% tokenized |
| `ChatDrawer.tsx` | 100% tokenized |

---

## 6. Action Items for Dark Mode Prep

### Phase 1: Fix Hardcoded Colors (High Priority)
- [ ] Add lifecycle tokens to `globals.css`
- [ ] Update `OpportunityCardV2.tsx` to use lifecycle tokens
- [ ] Update `OpportunityDrawer.tsx` to use lifecycle tokens
- [ ] Add chart tokens for Sparkline
- [ ] Update `Sparkline.tsx` to use chart tokens
- [ ] Fix `PackageRow.tsx` hex values

### Phase 2: Add Platform & Overlay Tokens (Medium Priority)
- [ ] Decide: tokenize platform colors or keep brand-specific
- [ ] Add overlay tokens: `--kairo-color-overlay-light`, `--kairo-color-overlay-dark`
- [ ] Add glass effect tokens for header

### Phase 3: Add Dark Mode Values (After Phase 1-2)
- [ ] Add `.dark` variants for all color tokens
- [ ] Add theme toggle component
- [ ] Add system preference detection
- [ ] Test all components in dark mode

---

## 7. Token Usage Summary

| Category | Tokens Defined | Hardcoded Offenders |
|----------|----------------|---------------------|
| Colors (Aqua) | 7 | 0 |
| Colors (Ink) | 6 | 0 |
| Colors (Surface) | 2 | 0 |
| Colors (Border) | 2 | 0 |
| Colors (Tags) | 10 | 0 |
| Colors (Action) | 6 | 0 |
| Colors (Lifecycle) | **0** | **10** |
| Colors (Platform) | **0** | **5** |
| Colors (Chart) | **0** | **4** |
| Typography | 11 | 0 |
| Radius | 5 | 0 |
| Shadows | 3 | 4 (custom) |
| Motion | 5 | 0 |

**Total hardcoded color issues: ~23 instances across 4 files**
