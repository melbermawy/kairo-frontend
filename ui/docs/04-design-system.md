# 04 – design system (kairo UI)

this file defines the visual language for kairo’s **hero demo** and future product.
goal: calm, clear, “north coast” beach energy without being gimmicky.

---

## 1. brand attributes

- **clarity** – surfaces feel clean, readable, low-noise.
- **calm speed** – the app feels fast but not frantic.
- **trusted partner** – never looks like a toy ai playground.

translate to ui:

- low visual noise, few colors, strong hierarchy.
- soft edges, subtle depth, no skeuomorphic clutter.
- consistent motion: purposeful, small, never flashy.

---

## 2. color system

### 2.1 base palette (north coast)

> hex values are starting points; we can tweak slightly in implementation.

- `sand-50`  – `#F8F3EC` (main app background)
- `sand-100` – `#F1E6D6` (secondary background / cards on sand)
- `aqua-50`  – `#E2F7F9` (subtle highlight, chips, soft panels)
- `aqua-200` – `#BFEFF4` (secondary accent)
- `aqua-500` – `#5FD2E3` (primary accent on light bg)
- `deep-600` – `#045C96` (primary brand color / nav)
- `deep-800` – `#033D63` (hover / pressed / high-contrast text on light aqua)
- `taupe-700` – `#3D3A35` (primary text on sand)
- `taupe-400` – `#807873` (secondary text / labels)
- `danger-500` – `#C94B4B` (errors, destructive)
- `success-500` – `#1C9A6C` (success, healthy state)

### 2.2 semantic roles

- **app background**
  - default: `sand-50`
  - alt sections (e.g. secondary columns): `sand-100`

- **surface / card**
  - primary card: white `#FFFFFF` on `sand-50`
  - elevated panel (opportunities board, content package): white with subtle shadow
  - “water” panels (analytics strips / insights): `aqua-50`

- **primary actions**
  - button bg: `aqua-500`
  - button text: `#FFFFFF`
  - hover: blend towards `deep-600`
  - disabled: `aqua-200` with `taupe-400` text

- **nav**
  - top nav / key anchors: gradient from `deep-800` → `deep-600` (very subtle) or solid `deep-600`
  - nav text / icons: `#FFFFFF` (primary), `#E2F7F9` (muted)

- **text**
  - primary text on light bg: `taupe-700`
  - secondary / meta text: `taupe-400`
  - text on deep bg: `#FFFFFF`

- **borders / dividers**
  - borders: `#E3DDD4` (thin, 1px)
  - strong dividers: `#D2C8BB` (only where necessary)

- **feedback states**
  - error: `danger-500` (text + icons) on very pale red `#FDECEC`
  - success: `success-500` on `#E4F7EF`
  - info: `deep-600` on `aqua-50`
  - warning (rare): `#D9851B` on `#FFF3E0`

---

## 3. typography

target: system-feeling, modern, no “startup circus fonts”.

### 3.1 font families

- **primary ui font**: `Inter` (or `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` fallback)
- **code / small numbers (optional)**: `JetBrains Mono`, `Menlo`, `monospace`

### 3.2 type scale (desktop baseline)

- `display-1` – 32px / 40px – used sparingly (hero title, brand picker top)
- `h1` – 24px / 32px – page title
- `h2` – 20px / 28px – section headings (e.g. “today’s opportunities”)
- `h3` – 18px / 24px – card titles, column headers
- `body-1` – 14px / 20px – main body text, labels, chip text
- `body-2` – 13px / 18px – secondary text, helper text
- `caption` – 11–12px / 16px – meta, timestamps, tag labels

weights:

- primary headings: `600`
- body text: `400`
- emphasis: `500` (avoid italics except in very rare cases)

---

## 4. spacing, layout, and radii

### 4.1 spacing scale (px)

- `4` – tight
- `8` – base unit
- `12` – small gaps
- `16` – standard spacing between elements
- `24` – section padding / card internal padding
- `32` – large section spacing
- `48` – page-level gutters

rules:

- use multiples of `4`.
- most card padding: `16` or `20`.
- page outer padding: `24`–`32` depending on viewport.

### 4.2 radii

soft beach, not pill-everything.

- small elements (chips, inputs): `8px`
- cards, panels: `12px`
- modals / drawers: `16px`
- buttons: `999px` for primary/secondary (subtle pill)

### 4.3 shadows

very subtle, mostly to separate white cards from sand.

- **card shadow**  
  `0 6px 18px rgba(0, 0, 0, 0.06)`
- **floating chat / key overlays**  
  `0 10px 32px rgba(0, 0, 0, 0.10)`

never use multiple stacked shadows.

---

## 5. components (visual rules)

this is not a full component library spec, just the visual decisions that matter.

### 5.1 buttons

variants:

- **primary**
  - bg: `aqua-500`
  - text: `#FFFFFF`
  - hover: approach `deep-600`, keep contrast high
  - disabled: `aqua-200`, `taupe-400` text, no shadow

- **secondary**
  - bg: white
  - border: `#D2C8BB`
  - text: `taupe-700`
  - hover: `aqua-50` bg

- **ghost / quiet**
  - bg: transparent
  - text: `deep-600`
  - hover: `aqua-50` with subtle border `#E3DDD4`

shape:

- pill with `border-radius: 999px`
- consistent horizontal padding: `12–16px`, vertical: `8–10px`

### 5.2 inputs / selects / textareas

- bg: white on sand backgrounds
- border: `#DCD2C4`
- focus:
  - border-color: `aqua-500`
  - 1px focus ring: `0 0 0 1px rgba(95, 210, 227, 0.4)` (not huge)

- labels: `body-2`, `taupe-700`
- helper text / error: `caption`, `taupe-400` or `danger-500`

### 5.3 cards

used for:

- brand tiles
- opportunity cards
- content packages
- pattern cards

style:

- bg: white
- radius: `12px`
- padding: `16–20px`
- border: `#E3DDD4` or none + subtle shadow
- header row (title + meta) separated with `8px` or thin divider.

### 5.4 chips / tags

- radius: `999px`
- padding: `4px 10px`
- variants:

  - filled (persona / pillar): `aqua-50` bg, `deep-600` text
  - outline (status): transparent bg, border `#D2C8BB`, text `taupe-700`
  - danger: `#FDECEC` bg, `danger-500` text

### 5.5 navigation

**top bar**

- height: ~64px
- bg: solid `deep-600` (or very subtle gradient)
- left: kairo logo + brand selector
- right: user avatar, settings, help

**side rail (if used in future)**

- bg: `sand-100` or white
- icons: `taupe-400` default, `deep-600` for active
- active item: pill highlight with `aqua-50` bg.

---

## 6. motion & interaction

### 6.1 core timing

- standard transition: `160–220ms ease-out`
- modals / drawers: `220–260ms`
- no bouncy cubic-bezier; keep it calm.

### 6.2 patterns

- hover:
  - slight scale (`1.01`) only for major cards, or just color/ shadow change.
- drag / drop (board-style sections):
  - shadow intensifies while dragging, then snaps cleanly.
- global chat:
  - slide-in from right with fade, `220ms`, no overshoot.
- skeleton loading vs spinners:
  - prefer skeletons for lists/boards; avoid full-screen spinners.

---

## 7. iconography & illustration

- icons: use an outlined, geometric set (e.g. lucide-style).
- stroke color: `taupe-700` on light bg, `#FFFFFF` on deep nav.
- stroke width: consistent (2px).
- avoid heavy colored icons; only use accent color for emphasis states.

illustration:

- minimal; if used at all, use flat shapes in the same palette (sand/aqua/deep).
- no stock-photo beach images in the product ui; beach is **only** reflected through palette and softness.

---

## 8. data visualization primitives (for demo)

we only need light analytics viz in hero demo:

- axes + labels: `taupe-400`
- line / area:
  - primary series: `deep-600`
  - secondary: `aqua-500` with alpha `0.3`
- background: white card on `sand-50`
- gridlines: `#EEE5D8` (very light)

keep charts simple: 1–2 series, no rainbow.

---

## 9. accessibility

hard constraints:

- minimum contrast:
  - text vs background: WCAG AA (4.5:1) for body sizes.
  - check combinations: `taupe-700` / `sand-50`, `#FFFFFF` / `deep-600`, etc.
- focus states:
  - every interactive element must have a visible focus treatment (border or ring).
- never encode information by color alone:
  - e.g. status chips use icon or label + color, not color-only.

---

## 10. implementation notes

- centralize tokens as css variables / theme object:

```ts
// example ts snippet
export const colors = {
  sand50: "#F8F3EC",
  sand100: "#F1E6D6",
  aqua50: "#E2F7F9",
  aqua200: "#BFEFF4",
  aqua500: "#5FD2E3",
  deep600: "#045C96",
  deep800: "#033D63",
  taupe700: "#3D3A35",
  taupe400: "#807873",
  danger500: "#C94B4B",
  success500: "#1C9A6C",
};

- use tailwind (or similar) but keep a small custom layer for these tokens, not ad-hoc hex values within components.
- when in doubt: less saturation, more whitespace, fewer borders.