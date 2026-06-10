# A2A Circular Design Language — Design System Reference

> Source: 75 PDF exports from the A2A Figma design system ("A2A — Circular Design Language").  
> All values below are authoritative specs from the CDL. App tokens in `src/index.css` may diverge — see **Color** section for the canonical palette.

---

## 1. COLOR

### Identity & Primary

| Token | Hex | Usage |
|-------|-----|-------|
| Azure 500 | `#0B9AEC` | **A2A identity color** — primary brand |
| Azure 600 | `#0a8cd7` | Primary interactive (buttons, links) |
| Blue 500 | `#016ABD` | Secondary brand accent |
| Blue 800 | `#013A68` | Dark backgrounds (nav, footers) |

> **Note:** The current app uses `#1B6CA8` as `--color-a2a-blue`. The canonical CDL primary is Azure 500 `#0B9AEC`. Update tokens if alignment to CDL is required.

### Grey Scale

| Token | Hex |
|-------|-----|
| Grey 800 | `#636B71` |
| Grey 300 | `#DAE5EE` |
| Grey 100 | `#EEF3F7` |

### Semantic / Status

| Role | Hex |
|------|-----|
| Success / Green | `#1AAA55` |
| Warning / Orange | `#FC9403` |
| Error / Red | `#DB3B21` |

### Primitive Scales (50–900)
Full primitive scales exist for: **Blue, Azure, Green, Lime, Orange, Violet, Deep Orange, Pink, Teal, Brown**.  
Use semantic/primary tokens; only reach for primitives when building new components that require custom tinting.

### Icon Color Rules
- All non-brand, non-illustrative icons → **Azure 500** (`#0B9AEC`) or greyscale only.
- Informational / functional / navigation icons only → informational color variants.
- Never use primitive palette colors on icons without design approval.
- Never distort icon aspect ratio.

---

## 2. TYPOGRAPHY

**Font family:** Life Sans (custom A2A typeface)  
**Fallback:** Arial, sans-serif  
**Weights available:** 450 (Regular), 550 (Medium), 650 (SemiBold), 750 (Bold) + italic variants  

### Critical Rule
**NO ALL CAPS** — except for the Primary CTA button label. All other text: sentence case or title case only.

### Type Scale

| Level | Size | Usage |
|-------|------|-------|
| Display 01 | 156px | Hero headlines |
| Display 02 | ~120px | Large hero |
| Display 03 | ~96px | Section hero |
| Title 01 | ~72px | Major section title |
| Title 02 | ~56px | Page title |
| Title 03 | ~40px | Section title |
| Title 04 | ~32px | Subsection title |
| Title 05 | ~24px | Card/block title |
| Heading h1–h5 | 24–16px | Semantic headings |
| Body long 01 | 18px | Editorial body |
| Body long 02 | 16px | Standard body |
| Body short 01 | 16px | UI body (compact) |
| Body short 02 | 14px | Small UI text |
| Caption 01 | 14px | Image captions, labels |
| Caption 02 | 12px | Fine print |
| Helper 01–02 | 12px | Form hints, tooltips |

---

## 3. SPACING

Responsive scale (Max/Xlg → Md → Sm):

| Level | Max/Xlg | Md | Sm |
|-------|---------|----|----|
| spacing01 | 2px | 2px | 2px |
| spacing02 | 4px | 4px | 4px |
| spacing03 | 8px | 8px | 8px |
| spacing04 | 16px | 16px | 16px |
| spacing05 | 24px | 24px | 24px |
| spacing06 | 32px | 32px | 32px |
| spacing07 | 48px | 40px | 40px |
| spacing08 | 64px | 48px | 48px |
| spacing09 | 96px | 80px | 64px |
| spacing10 | 160px | 120px | 96px |
| spacing11 | 240px | 184px | 144px |
| spacing12 | 320px | 240px | 184px |

---

## 4. GRID SYSTEM

| Breakpoint | Name | Columns | Gutter | Notes |
|------------|------|---------|--------|-------|
| >1921px | Max | fluid | 32px | Max-width containers |
| 1024–1920px | Xlg | fluid | 32px | Standard desktop |
| 768–1023px | Md | fluid | 32px | Tablet |
| <767px | Sm | 4 cols | 16px | Mobile |

Container inner padding: 24px (left/right) at Max/Xlg.

---

## 5. ANIMATION

**Standard:** 300ms `easeOutQuart` — `cubic-bezier(0.25, 1, 0.5, 1)`

**Rules:**
- Scroll-triggered animations fire **once only** (no re-trigger on scroll-up/down).
- Default entrance direction: **from below** (translate Y).
- All interactive components (buttons, links, filters, forms, navigation): 300ms easeOutQuart.
- Autosuggest / search suggestions: fade-in from 0% opacity, 400ms easeOutQuart.

**Exception — Modal Video:** 800ms fade-in `easeOutQuart` (only case with longer duration).

---

## 6. IMAGE RATIOS

Standard aspect ratios: **2:3, 3:2, 16:9, 9:16, 1:1** (square and circular).  
Two separate crops required for mobile (Sm breakpoint) on hero/cover images.

---

## 7. ICONS

### Iconset
A2A maintains a proprietary iconset available as SVG (~2MB download).  
Categories: Accessibility, Animals, Arrows, Audio, Automotive, Basic, Beverage, Business, Camping, Communication, Construction, Content, Controls, Currency, Date, Design, Development, Device, Editor, Education, Email, **Energy** (A2A-specific: hydro, solar, gas, biogas, biomass, etc.), Entertainment, File types, Finance, Food, Games, Hardware, Health, Household, Hygiene, Maps, Maritime, Music, People, Places, Security, Shopping, Sports, Time, Transportation, Travel, Weather, and more.

### Standard Sizes
16px (minimum), 24px, 32px, 48px, 64px, 96px, 120px.  
Always use icons at their originally produced size. Do not scale arbitrarily.

### Design Rules
- **Square grid:** all icons are built on a square grid base — line, stroke, proportion, shape, and position are governed by the grid.
- **Simplicity:** "less is more" — minimal detail, maximum clarity.
- **Stroke weight scales with text:** icon next to larger text → heavier stroke. Example: 60px text → 2px stroke; 18px text → 1.5px stroke (~70% rule).
- **Optical center alignment:** icons are optically centered within their bounding box.
- **Touch target minimum:** 32px. If the icon is smaller than 32px, add CSS padding to meet the 32px minimum.

### Semantic Icon Mapping

| Icon | Use case |
|------|----------|
| `arrow-right` | Internal navigation within the same architecture |
| `arrow-up-right` | External link (leaves the current site/architecture) |
| `download` | File/document download action |
| `mail` | Newsletter signup (only use case for this icon in CTAs) |

---

## 8. PRIMARY CTA

- Label: **ALL CAPS** (only exception to the no-all-caps rule).
- Visual: text + arrow-in-circle icon.
- Hover: 300ms magnetic hover (XY axis movement).
- Variants: Default (azure), `$white`, `$white-dark`.
- Animation: 300ms easeOutQuart.

---

## 9. ICON BUTTON (CTA Icon)

- Icon-only variant of the CTA.
- Also: Button circle (circular container + icon).
- Same states, colors, and timing as Primary CTA.
- Used for close actions, search triggers, directional navigation.

---

## 10. GHOST LINKS

Secondary action links (lower visual weight than Primary CTA).  
- Variants: with arrow / plain / small / arrow-left.
- Color: Azure by default; `$white` variant for use on dark backgrounds.
- Animation: 300ms easeOutQuart.

---

## 11. LINK SMALL

Compound atom: **tag + filename + description + ghost CTA**.  
- External links use ↗; internal links use →.
- Filename: ~90–100 characters max.
- Description: ~220–250 characters max.

---

## 12. DOWNLOAD SMALL

Compound atom: **tag + filename + description + extension/size badge + download icon**.  
- Locked variant: requires user registration before download is enabled.

---

## 13. NAVIGATION

### Global Navigation (Top Bar)
- Contains: ticker strip + logo + nav items.
- Opens §global-search by clicking the search icon (search overlay replaces nav, logo stays).
- Megamenu: 3 levels max, opens up to 80% of viewport height, 40% black overlay behind.
- Md/Sm: hamburger menu triggers step-by-step navigation.

### Local Navigation
- Per-section navigation bar, positioned below global nav.
- Sticky on scroll (same behavior as §anchor-menu).

### Media Navigation
- Positioned below `§hero-left` in the Media section.
- Click on a nav item → content below updates (no full page reload).
- Behavior mirrors `§anchor-menu` (sticky on scroll, appears from below on scroll).
- Md: truncates with `>` overflow indicator; Sm: further truncation.

---

## 14. GLOBAL SEARCH

Triggered by clicking the search icon in `§navigation`.  
- Opens as an overlay covering the full navigation; A2A logo remains visible.
- Close via `§cta-icon` in the top-right corner.
- Auto-suggest activates after **3 characters** typed.
- Suggestions: exact page name, description, or CMS-configured keywords.
- Maximum **5 suggestions** at any breakpoint.
- Maximum **10 quick links** (shown before typing begins).
- Typed text: Blue 800 (`#013A68`); auto-completed portion: Grey 800 (`#636B71`).
- Component starts with fixed height; expands to full screen as user types.
- Activation methods: click/tap lens icon (right), keyboard Enter, click/tap a suggestion.
- Animation: scroll entrance from below; suggestion list fades from 0% opacity, 400ms easeOutQuart.
- Mobile (Sm): opens as a full-screen modal on tap.

---

## 15. SEARCH MODULE FULL

Used for Financial Documents and Media section searches. Insertable inside `§container`.  
- Same auto-suggest behavior as Global Search (activates at 3 chars, max 5 suggestions).
- Search does **not reload the page** — content updates in place.
- Optional descriptive paragraph above the search bar.
- Mobile: opens a modal on tap (closeable with icon top-right).
- Animation: scroll entrance from below; suggestions fade in from 0% opacity, 400ms easeOutQuart.

---

## 16. ANCHOR LINKS & ANCHOR MENU

- `§anchor-menu`: sticky section navigation; becomes sticky as user scrolls past it.
- `§anchor-link` states: Active (underlined), Default, Hover (azure color).
- All levels are clickable; current page/section is visually indicated but not a link.
- Truncation at ≤1191px with `...`; vertical stack at 1024–1190px.
- Max/Xlg: anchored bottom-left.

---

## 17. BREADCRUMBS

- Every level clickable except the current page.
- Max/Xlg only by default.
- Truncation with `...` at ≤1191px.
- Vertical stacking at 1024–1190px.
- Anchored bottom-left.

---

## 18. FILTERS

- **Select filter:** variants — checkbox list / period range / period annual.
- **Filter bar:** shows active filters as dismissible chips.
- Live update: results update immediately on filter change (no submit button needed).
- Animation: 400ms.
- Md/Sm: filter UI opens as a bottom sheet.

---

## 19. TABLE

- Bootstrap-based structure.
- 3 cell styles: Base, Title, Title on `$grey100`.
- Horizontal scroll on overflow; scrollbar always visible (not hidden/auto).
- Appears from below on scroll.

---

## 20. ACCORDION

- Expands one item at a time (exclusive open).
- 3 typographic variants: Big / Medium / Small.
- Expansion animation: slides from below.
- Used inside `§list` sections.

---

## 21. LIST (§list)

- Max 9 items before "Carica altri" (load more) button appears, in increments of 9.
- Layout: 9 columns + 24px left padding at Max/Xlg.
- Items separated by `§divider`.

---

## 22. COLUMN LIST

- Lower visual weight than `§list`.
- Max 3 columns at Max/Xlg.
- Used inside `§container` right section (spalla destra).

---

## 23. CONTAINER (§container)

3-area layout:
1. **Spalla sinistra** (left shoulder): optional sidebar/intro area.
2. **Contenuto principale**: main content, 24px padding, starts at column 4.
3. **Spalla destra** (right shoulder): supplementary content.

Background options: `$white`, `$grey100`, `$azure500`, `$blue800`.

---

## 24. COVER IMAGE

- Width: 6 columns at Max/Xlg with 24px padding.
- Text anchored bottom-left.
- Variable height.
- Z-stack: 3 layers — text (top) / overlay / media (bottom).
- Overlay: `$black` or `$white`, 0–60% opacity, configurable from CMS in 5-unit increments.
- Title: ~40 characters max.
- Two image crops required (one for desktop, one for mobile).
- Scroll animation fires once.

---

## 25. DIVIDER

- Always 100% of container width.
- Horizontal line only.

---

## 26. NOTICE

Contextual popup/callout.  
- Width: 5 columns at Max/Xlg; full 12 columns at Md/Sm.
- Has a close button.
- Padding: 12px / 40px / 32px.
- Appears from below on scroll.

---

## 27. CARD INFO ITEM

Structure: label categoria + titolo + TAG + data + CTA.  
- Width: 9 columns at Max/Xlg.
- Backgrounds: `$gray100` or `$azure500`.
- Pagination: max 8 items, then "Carica di più" in increments of 8.
- Hover: title color transitions to `$blue500`.

---

## 28. CARD LIST ITEM

Structure: TAG(s) + Titolo + luogo + descrizione + CTA.  
- Variants: with or without image.
- Same pagination rules as Card Info Item (max 8 + "Carica di più" in 8s).

---

## 29. RESULT ITEM (E4S4C149)

Structure: label categoria (optional) + titolo + TAG + data (optional) + CTA (optional).  
- Width: 9 columns at Max/Xlg.
- Max 8 items + "Carica di più" in increments of 8.
- `spacing07` between items with `§divider`.
- `spacing09` before "load more" CTA.
- Hover: title → `$blue500`.
- Appears from below on scroll.

---

## 30. EVENT IMAGE CARD (E3S1C015)

Structure: preview image + title (max 2 lines, azure color) + category chip + date.  
- Appears from below on scroll.

---

## 31. GRID-2 COLUMNS

- Max/Xlg: 2 items per row (6 columns each, 32px gutter).
- Md: 2 items per row.
- Sm: single column.
- Pagination: max 8 items.

---

## 32. GRID-3 COLUMNS

- Max/Xlg: 3 items per row.
- Md: 2 items per row.
- Sm: single column.
- Pagination: max 9 items.

---

## 33. ICON HIGHLIGHT (E3S2C125)

Structure: icon + title + description (~100–120 chars) + CTA.  
- Max 3 items per row.
- Used inside `§container` right section (spalla destra).

---

## 34. BIG DATA ITEM / DATA GROUP / DATA ITEM

KPI display components.  
- Value displayed in `$azure500`.
- Unit text separated by 16px from value.
- Configurations: 2-column or 3-column.
- Animation order: icon → numbers left-to-right → unit → divider → subtitle.

---

## 35. DOORWAY BOX

"Exit" navigation component.  
- Label text: max 50–60 characters.
- Used inside `§doorway-module-4` (4 boxes, full viewport width, 1px dividers between).

---

## 36. DOORWAY IMAGE (E3S1C032)

Structure: title + paragraph + image (anchored bottom) + `§cta-icon`.  
- Used inside `§doorway-module-2`.

---

## 37. FORMS

All form components follow 300ms easeOutQuart animation.

| Component | Notes |
|-----------|-------|
| Input Text | States: default, focus, filled, error, disabled |
| Checkbox | Standard multi-select |
| Radio Button | Single-select |
| Input Select (dropdown) | Native-style select with custom styling |
| Text Area | Multi-line input |
| Upload | Max 500MB; drag-and-drop + click |

**Error handling:**
- Contextual errors appear **after blur** (not on keystroke).
- On submit with errors: page scrolls to **96px above the first error field**.

---

## 38. MODAL SMALL

- Width: 6 columns at Max/Xlg and Md; full width at Sm.
- Overlay: 30% black behind modal.
- Mobile (Sm): fullscreen, no overlay.
- Animation: from below.

---

## 39. MODAL BIG / MODAL FULL

- Width: full content area.
- Height: viewport height minus 56px.
- Layout at Max/Xlg: left area (6 cols) + right area (3 cols).
- Md/Sm: vertical stack.

---

## 40. MODAL VIDEO

- Width: 10 columns at Max/Xlg.
- Video source: YouTube.
- Animation: **800ms fade-in** easeOutQuart (only exception to the 300ms standard).

---

## 41. QUOTE

Structure: circular 1:1 photo (optional) + quote text + author name.  
- Width: 9 columns at Max/Xlg.
- Spacing: `spacing09` inside articles; `spacing11` on section pages.
- Animation: from below.

---

## 42. QUOTE SLIDER ITEM

Quote item used within carousel/slider context.  
- Same typography and composition rules as standalone Quote.

---

## 43. RATING

- Scale: 1–5 stars (used for video ratings).
- Modes: Static and Interactive.
- Sizes: Big and Small.
- Hover: progressive fill left-to-right.

---

## 44. DIAGRAM

Full-screen 2-axis scrollable table/diagram.  
- Sticky close button + navigation arrows.
- Navigation arrows disabled at boundaries (start/end).
- L2 items connected with a white line.

---

## 45. ICON MODULE 2 (E3S1C078) / ICON MODULE ITEM (E3S1C077)

7 configuration variants combining: icon / title / description / CTA.  
- Minimum 2 items always (never used as a single standalone item).
- Items displayed side-by-side inside `§icon-module-2`.

---

## 46. IMAGE ITEM (E3S2C126) / IMAGE ITEM WITH LINK / IMAGE LINK (E3S2C143)

- Used as carousel children.
- All items: same height within a carousel.
- Click: opens zoom modal with gallery navigation.
- Optional badge: 120×120px, positioned 16px from top-left of image.

---

## 47. TESTIMONIAL

- Used on homepage as a carousel.
- Navigation: transparent full-menu style (no background).
- Preceded by `§container` intro block.
- Spacing: `spacing10` from intro block to carousel; `spacing08` below carousel.

---

## 48. PODCAST BANNER

Editorial component for podcast promotion.  
- Max 3 cards displayed.
- Sticky scroll animation: viewport locks while scrolling through cards.
- Trailer audio player with progress bar.
- Card exits viewport downward on scroll.
- Audio mutes when scrolled out of view.

---

## 49. SPLIT MEDIA

Split layout: media on one side, text content on the other.  
- **16:9 variant:** standard widescreen media.
- **3:2 variant:** image fills left or right half of viewport; text on opposite side.

---

## 50. ICON TIMELINE

Timeline using icons as milestone markers.  
- Horizontal or vertical orientation.
- Icon nodes mark each milestone.

---

## 51. GRID MEDIA

Media-focused grid layout for image/video galleries.  
- Responsive column collapse on smaller breakpoints.

---

## 52. LOADER

Full-screen loading state.  
- White background.
- Hides `§navigation`.
- A2A logo centered.
- Animated progress bar.

---

## 53. FOOTER

- Multi-column navigation links (max 8 items per column).
- Sm: columns collapse into accordion groups.
- Social media icons.
- Animation: 300ms easeOutQuart; appears from below.

---

## Summary: Animation Quick Reference

| Duration | Easing | Used for |
|----------|--------|----------|
| 300ms | easeOutQuart `cubic-bezier(0.25, 1, 0.5, 1)` | All standard interactions (buttons, links, nav, forms, modals) |
| 400ms | easeOutQuart | Search suggestions (fade from 0% opacity) |
| 800ms | easeOutQuart | Modal video fade-in only |

---

## Summary: Key Developer Rules

1. **Font:** Life Sans (weights 450/550/650/750), fallback Arial. Never ALL CAPS except Primary CTA labels.
2. **Primary color:** Azure 500 `#0B9AEC` (CDL spec); current app tokens use `#1B6CA8` (divergence noted).
3. **Spacing:** Use the responsive spacing scale, not arbitrary pixel values.
4. **Icons:** Only Azure or greyscale; minimum touch target 32px; available sizes 16/24/32/48/64/96/120px.
5. **Animations:** Always 300ms easeOutQuart from below, fires once. Modal video = 800ms.
6. **Search suggestions:** 400ms, fade from 0% opacity.
7. **Forms:** Errors after blur only; scroll 96px above first error on submit.
8. **Pagination:** Cards in 8s ("Carica di più"), lists in 9s ("Carica altri").
9. **External links:** `arrow-up-right` icon. Internal: `arrow-right`. Downloads: `download` icon.
10. **Grid:** 4 breakpoints; mobile = 4 cols, 16px gutter; all others = fluid, 32px gutter.
