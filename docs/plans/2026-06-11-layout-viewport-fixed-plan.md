---
plan_id: layout-viewport-fixed
status: done
design_ref: docs/design/2026-06-11-layout-viewport-fixed.md
prd_ref: docs/prd/2026-06-11-layout-viewport-fixed.md
owner: p.prioriello
created: 2026-06-11
updated: 2026-06-11
sp_total: 1
critical_path: [T1]
---

# Piano: Layout a viewport fisso

## Task

### T1: Root a 100vh + sidebar scrollabile
**AC**: AC-01, AC-02 · **Dipendenze**: nessuna · **File**: `src/components/Layout.tsx`
Nel div root: `minHeight: '100vh'` → `height: '100vh'`, aggiunta `overflow: 'hidden'`.
Nell'`<aside>`: aggiunta `overflowY: 'auto'`.
Output atteso: scroll solo su `<main>`, sidebar/topbar fissi.

### T2: Verifica
**AC**: AC-03 · **Dipendenze**: T1
`npm test` e `npm run build` verdi; smoke manuale in dev.

## Verifica Finale
- [x] T1-T2 completati, build e test verdi (8/8, build ok — 2026-06-11)
