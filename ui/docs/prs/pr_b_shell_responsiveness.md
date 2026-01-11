# PR-B: Shell Responsiveness + Layout Contract

## Summary

This PR implements a responsive shell with true dark-first canvas, neutral header, and proper layout contract for mobile, tablet, and desktop breakpoints.

## Layout Contract

### Breakpoints

| Breakpoint | Width | Sidebar | Header | Content |
|------------|-------|---------|--------|---------|
| Mobile | < 768px (md) | Hidden, overlay drawer via hamburger | Fixed, 48px | Full width with 16px gutters |
| Tablet | 768px - 1024px (md-lg) | Pinned, 240px | Fixed, 48px | Centered, max-w-1200px, 24px gutters |
| Desktop | >= 1024px (lg) | Pinned, 240px | Fixed, 48px | Centered, max-w-1200px, 32px gutters |

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│                    TopBar (h-12, fixed, z-50)           │
├────────────┬────────────────────────────────────────────┤
│            │                                            │
│  Sidebar   │           Main Content Area                │
│  (w-240)   │     (scrollable, max-w-1200px, mx-auto)   │
│  (fixed)   │                                            │
│  (z-40)    │                                            │
│            │                                            │
└────────────┴────────────────────────────────────────────┘
```

### Z-Index Layers

- `z-50`: Header (TopBar)
- `z-50`: Mobile sidebar drawer (above everything)
- `z-40`: Mobile backdrop, Desktop sidebar

## Breakpoint Behavior

### Mobile (< md)

- Sidebar hidden by default
- Hamburger menu in TopBar toggles sidebar overlay
- Sidebar opens as 280px drawer from left
- Backdrop with blur, click to close
- Escape key closes drawer
- Body scroll locked when drawer open
- Content has 16px horizontal padding

### Tablet (md - lg)

- Sidebar pinned at 240px
- Content offset by sidebar width
- Content centered with max-width 1200px
- 24px horizontal padding

### Desktop (>= lg)

- Same as tablet with 32px horizontal padding
- Sidebar independently scrollable

## Token/Class Changes

### AppShell.tsx

**Before:**
- `bg-kairo-aqua-50` (light canvas)
- Inline padding without max-width
- Sidebar had its own fixed positioning

**After:**
- `bg-kairo-bg-app` (dark canvas)
- `max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8`
- Sidebar managed by AppShell with proper z-index

### TopBar.tsx

**Before:**
- `bg-kairo-accent-600` (screaming accent header)
- White text throughout

**After:**
- `bg-kairo-bg-elevated` (neutral dark surface)
- `border-b border-kairo-border-subtle` (subtle bottom border)
- Text uses `kairo-fg` and `kairo-fg-muted` tokens
- Accent only on CTA button and wordmark

### BrandSidebar.tsx

**Before:**
- Had `fixed` positioning, `w-[240px]`, `top-12`, `z-40`
- Managed its own layout

**After:**
- Simple `<nav>` without fixed positioning
- Parent (AppShell) handles fixed positioning and scroll
- Added `data-testid="brand-sidebar"` for testing

## Tokens Used

### Surfaces
- `bg-kairo-bg-app` - Main app background (#18181B)
- `bg-kairo-bg-panel` - Sidebar/panel background (#1F1F23)
- `bg-kairo-bg-elevated` - Header background (#3F3F46)
- `bg-kairo-bg-hover` - Hover states (#52525B)

### Borders
- `border-kairo-border-subtle` - Subtle dividers (#3F3F46)

### Foreground
- `text-kairo-fg` - Primary text (#FAFAFA)
- `text-kairo-fg-muted` - Secondary text (#A1A1AA)

### Accent (used sparingly)
- `bg-kairo-accent-600` - CTA button background
- `text-kairo-accent-400` - Wordmark, active states

## Files Changed

1. **src/components/layout/AppShell.tsx**
   - Dark-first canvas (`bg-kairo-bg-app`)
   - Proper layout structure (header, sidebar, main)
   - Mobile sidebar drawer with body scroll lock
   - Escape key handler
   - Max-width container for content

2. **src/components/layout/TopBar.tsx**
   - Neutral header background (`bg-kairo-bg-elevated`)
   - Subtle bottom border instead of accent bar
   - Semantic text colors
   - Added `data-testid` for mobile toggle

3. **src/components/layout/BrandSidebar.tsx**
   - Removed fixed positioning (now managed by AppShell)
   - Simplified to be a nav component
   - Added `data-testid` for testing

4. **src/components/layout/__tests__/shellResponsiveness.test.ts** (new)
   - Tests for mobile sidebar toggle
   - Tests for dark-first canvas (no bg-white)
   - Tests for max-width container
   - Tests for layout structure

## Verification Checklist

### Mobile (< 768px)
- [ ] Sidebar hidden by default
- [ ] Hamburger visible and functional
- [ ] Sidebar opens as overlay drawer
- [ ] Backdrop click closes drawer
- [ ] Escape key closes drawer
- [ ] Body scroll locked when drawer open
- [ ] No horizontal scroll

### Tablet (768px - 1024px)
- [ ] Sidebar pinned
- [ ] Content centered with max-width
- [ ] Dark canvas throughout (no light surfaces)
- [ ] Header is neutral (not accent colored)

### Desktop (>= 1024px)
- [ ] Sidebar pinned and independently scrollable
- [ ] Header sticky
- [ ] Content centered with max-width
- [ ] No double-scroll bugs

## Testing

Run tests:
```bash
npm test
```

Run build:
```bash
npm run build
```

## Screenshots Checklist

Viewports to verify:
- [ ] 375px (iPhone SE)
- [ ] 414px (iPhone Pro Max)
- [ ] 768px (iPad portrait)
- [ ] 1024px (iPad landscape / small desktop)
- [ ] 1440px (desktop)
- [ ] 1920px (large desktop)
