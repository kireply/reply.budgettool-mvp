# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Design System

**A2A Circular Design Language** — full specification in [`A2A_DESIGN_SYSTEM.md`](src/kb/A2A_DESIGN_SYSTEM.md).

Read that file before making any UI/styling changes.

### Typography

- **Font:** Life Sans (weights 450/550/650/750 + italics), fallback Arial.
- **NO ALL CAPS** anywhere — the sole exception is the Primary CTA button label.
- Type scale: 12–156px. Levels: Display 01–03, Title 01–05, Heading h1–h5, Body long/short 01–02, Caption/Helper 01–02.

### Color

- **CDL primary:** Azure 500 `#0B9AEC` (A2A identity color).
- App tokens are aligned to the CDL: CSS variables in `src/index.css` (`@theme {}`) and TS tokens in `src/theme.ts` — always import colors/weights from `src/theme.ts` in components, never hardcode hex values.
- Grey 800 `#636B71`, Grey 300 `#DAE5EE`, Grey 100 `#EEF3F7`.
- Status: Green `#1AAA55`, Orange `#FC9403`, Red `#DB3B21`.

### Grid & Spacing

- 4 breakpoints: **Max** (>1921px), **Xlg** (1024–1920px), **Md** (768–1023px), **Sm** (<767px — 4 cols, 16px gutter; all others fluid 32px gutter).
- Responsive spacing scale (spacing01–12); values change per breakpoint — see full table in design system doc.

### Animation

- **Standard:** 300ms `easeOutQuart` `cubic-bezier(0.25, 1, 0.5, 1)` — used for all buttons, links, forms, nav, modals.
- Scroll-triggered: fires **once only**, entrance **from below**.
- **Search suggestions:** 400ms, fade from 0% opacity.
- **Modal video only:** 800ms fade-in (only exception).

### Icons

- Color: Azure 500 or greyscale only (no other colors without approval).
- Touch target minimum: **32px** (add CSS padding if icon is smaller).
- Sizes: 16 / 24 / 32 / 48 / 64 / 96 / 120px — use as-produced, do not scale arbitrarily.
- Stroke scales with adjacent text weight (~70% rule).
- Semantic mapping: `arrow-right` = internal nav; `arrow-up-right` = external link; `download` = file download; `mail` = newsletter only.

### Components — key rules

- **Pagination:** card lists load in 8s ("Carica di più"); item lists in 9s ("Carica altri").
- **Forms:** contextual errors show after blur, not on keystroke; on submit scroll to 96px above first error.
- **Search (global & module):** auto-suggest activates at 3 characters; max 5 suggestions; mobile opens as full-screen modal.
- **Primary CTA:** ALL CAPS label + arrow-in-circle; magnetic hover 300ms.
- **Ghost links:** secondary actions; azure on light, $white on dark backgrounds.
- **Filters:** live update (no submit); bottom sheet on Md/Sm; 400ms animation.
- **Modals:** small = 6 cols; big/full = viewport height − 56px; video = 10 cols, 800ms fade.
- **Cover image:** 3-layer z-stack (text / overlay / media); overlay 0–60% opacity in 5-unit increments; ~40 char title max.
- **Image ratios:** 2:3, 3:2, 16:9, 9:16, 1:1 (square and circular).
- **Navigation:** sticky on scroll; megamenu max 3 levels, 80% viewport height, 40% black overlay; Md/Sm = hamburger step-nav.

## Project Overview

**A2A Budget Tool MVP** — a React prototype built for A2A (Italian energy company) by Reply. It manages IT budget lifecycle: WBS creation and cost entry, Purchase Request workflow, and advanced reporting. All data is mocked (no backend, no SAP integration). The PRD is in `prd_structured.txt`.

## Commands

```bash
npm run dev       # Start Vite dev server (auto-finds an available port starting at 5173)
npm run build     # TypeScript check + Vite production build
npm run preview   # Serve the production build locally
```

There are no tests or linting configured.

## Stack

- **React 19** + **TypeScript 6** via **Vite 8**
- **Tailwind CSS v4** — configured via `@theme {}` in `src/index.css` (no `tailwind.config.js`; uses `@tailwindcss/postcss` plugin)
- **Recharts** for all charts (Bar, Line, Pie, RadialBar)
- **Lucide React** for icons
- **React Router v7** for client-side routing

## Architecture

### Data layer (`src/data/mockData.ts`)

Single source of truth — all mock data and types live here. Key types:

- `WBS` — a budget unit with `costi: CostEntry[]`, each entry having `monthly: MonthlyData[]` (12-month distribution per scenario)
- `PurchaseRequest` — references a WBS via `wbsId`; state machine: `Bozza → Inviata → Approvata → Inviata a SAP → PO Creato` (or `Rifiutata`)
- `formatCurrency`, `getStatusColor`, `getWBSStatusColor` — shared formatting helpers exported from here

Pages import directly from `mockData.ts`; there is no state management library. `PurchaseRequests.tsx` holds local `useState` for the PR list (new PRs created in the form are added to a local copy).

### Internationalization (`src/i18n.tsx` + `src/translations.ts`)

Custom lightweight i18n (no library). `LanguageProvider` wraps the app in `App.tsx`; components call `useI18n()` for `t(key, vars?)`, `lang`, `setLang`, and localized `months`. Languages: `it` (default — PRD language), `en`, `fr`, `de`; choice persists in localStorage. The selector is a custom flag dropdown (`src/components/LanguageSelect.tsx` + `src/components/Flag.tsx` — inline SVG flags, since emoji flags don't render on Windows) in the sidebar above the user info. Rules:

- All UI strings go through `t()` with keys in `src/translations.ts` (flat dot-notation, `{var}` interpolation). Never hardcode UI text in components.
- Mock data values (WBS names, areas, suppliers, cost items) are data, not UI — they stay untranslated. Status values (`Bozza`, `Attiva`, …) remain Italian in data/state; only their display labels are translated via `status.*` / `wstatus.*` keys.

### Routing (`src/App.tsx`)

All routes are wrapped in a single `<Layout>`. Routes:

- `/` → Dashboard
- `/wbs` → WBSList
- `/wbs/new` → WBSNew (creation form; new WBS are pushed into the `wbsData` array via `addWBS` — session-only, no persistence)
- `/wbs/:id` → WBSDetail
- `/purchase-requests` and `/purchase-requests/new` → PurchaseRequests (same component, `useSearchParams` for `?wbs=` pre-selection)
- `/reportistica` → Reportistica

### Styling conventions

Tailwind v4 utility classes are used sparingly. Most component layout uses **inline `style={}` props** (flexbox, grid), with colors and font weights imported from `src/theme.ts`. Global CSS classes defined in `src/index.css`:

- `.card` — white box, 12px radius, Grey 300 border, azure border on hover
- `.sidebar-item` / `.sidebar-item.active` — sidebar nav links (Blue 800 sidebar, Azure 500 active pill)
- `.cta-primary` (+ `.cta-circle`) — Primary CTA: ALL CAPS label + arrow-in-circle, magnetic hover
- `.btn-secondary` — outline pill button
- `.ghost-link` — azure secondary action link with arrow
- `.tab` / `.tab.active` — anchor-link style tabs
- `.badge` + `.badge-*` — status pills (returned by `getStatusColor`/`getWBSStatusColor` in `mockData.ts`)
- `.input` / `.select` — form controls with azure focus ring
- `.table-head` — Grey 100 table header row
- `.animate-in` — 300ms easeOutQuart entrance from below (fires once)

CDL palette (CSS variables in `@theme {}`, TS tokens in `src/theme.ts`):

- Azure 500 `#0B9AEC` (primary/identity), Azure 600 `#0A8CD7` (interactive), Blue 500 `#016ABD`, Blue 800 `#013A68` (dark surfaces/headings), Green `#1AAA55`, Orange `#FC9403` (impegnato), Red `#DB3B21` (over-budget/rejected)

### Budget availability check

In `PurchaseRequests.tsx`, the real-time budget check computes:

```javascript
disponibile = wbs.rollingTotale − sum(importo of non-Rifiutata PRs on that WBS)
```

The submit button is disabled if `importo > disponibile`.
