---
spec_id: impegnato-derivato-timeline-csv
status: approved
prd_ref: docs/prd/2026-06-11-impegnato-derivato-timeline-csv.md
owner: p.prioriello
created: 2026-06-11
updated: 2026-06-11
---

# SPEC: Impegnato derivato dalle PR, timeline stati PR, export CSV

## 1. Architettura

Nessun nuovo layer: si estende il data layer esistente (`src/data/mockData.ts`,
store module-level + localStorage) e si aggiunge una util pura (`src/utils/csv.ts`).
Le pagine continuano a leggere dallo store a render-time.

## 2. Data model

- `WBS.impegnato` **rimosso**. Nuova funzione esportata
  `impegnatoOf(wbsId): number` = Σ `importo` delle PR della WBS con stato in
  `{Approvata, Inviata a SAP, PO Creato}`.
- `PurchaseRequest.storia: StatusEvent[]` con `StatusEvent = { stato: PRStatus, data: string }`.
  - `addPurchaseRequest`: la PR nasce con `storia = [{Bozza, oggi}]` (fornita dal chiamante).
  - `updatePRStatus`: appende `{nuovoStato, oggi}`.
- `STATUS_FLOW` spostato da `PurchaseRequests.tsx` a `mockData.ts` (export unico).
- Seed: 13 PR (7 nuove) rinumerate cronologicamente `PR-2026-0001..0013`,
  calibrate perché `impegnatoOf` restituisca i valori demo storici
  (185k / 320k / 95k / 82k / 198k / 45k). Storia seed generata da helper
  `storiaFor(statoFinale, dataCreazione)` con offset di giorni plausibili.
- `STORAGE_KEY` → `a2a-budget-tool-data-v3` (cambio shape: dati v2 ignorati).

## 3. Semantiche budget

- Il **budget check** della pagina PR resta `rollingTotale − Σ PR non rifiutate`
  (prudenziale: conta anche Bozza/Inviata per prevenire overcommit).
- L'**impegnato** mostrato (KPI, tabelle, grafici) conta solo le PR confermate.
  Le due metriche ora sono entrambe derivate dalle PR e si muovono live.

## 4. UI

- **Modale dettaglio PR** (`PurchaseRequests.tsx`): click su riga → modale CDL
  (overlay nero 40%, card ≤560px, animate-in 300ms easeOutQuart) con anagrafica,
  note e timeline verticale degli stati; chiusura via X / overlay / bottone.
  Le azioni avanza/rifiuta nelle righe usano `stopPropagation`.
- **Export CSV**: `buildCsv(headers, rows)` pura (separatore `;` per Excel
  it-IT, quoting RFC4180, CRLF) + `downloadCsv(filename, ...)` (BOM UTF-8,
  Blob + anchor). WBSList esporta le righe filtrate; Reportistica esporta il
  dataset della vista attiva (area / scostamenti / trend).
- Nuove chiavi i18n ×4 lingue: `pr.detailTitle`, `pr.timeline`, `pr.creatore`,
  `common.close`; label `wbs.export` → "Export CSV".

## 5. Test

Vitest (primo test-infra del progetto, stub localStorage in `vitest.setup.ts`):
unit test su `impegnatoOf`, `updatePRStatus` (storia) e `buildCsv`.

## 6. Documentazione

`CLAUDE.md` aggiornato: impegnato derivato, storia PR, storage v3, util CSV,
comando test; correzione nota "session-only" e riferimento PRD rimosso.

## 7. Rischi

- Dati v2 in localStorage di utenti demo esistenti vengono scartati (accettato:
  è un prototipo; `resetDemoData()` resta disponibile).
- Le pagine non sono reattive alle mutazioni cross-vista (limite preesistente,
  fuori scope).

## 8. Acceptance Criteria

- **AC-01** `impegnatoOf(wbsId)` somma solo PR `Approvata`/`Inviata a SAP`/`PO Creato` della WBS e riflette live i cambi di stato.
- **AC-02** Il campo statico `WBS.impegnato` non esiste più; Dashboard, WBSList, WBSDetail, Reportistica usano `impegnatoOf`.
- **AC-03** Con il seed: wbs-001=185000, wbs-002=320000, wbs-003=95000, wbs-004=82000, wbs-005=198000, wbs-006=45000.
- **AC-04** Ogni PR ha `storia`; `updatePRStatus` appende `{stato, data:oggi}`; le nuove PR nascono con `[{Bozza, oggi}]`.
- **AC-05** Click su riga PR apre la modale con anagrafica e timeline; avanza/rifiuta non aprono la modale.
- **AC-06** I bottoni Export scaricano un CSV (`;`, BOM, CRLF) con intestazioni tradotte: WBSList → righe filtrate; Reportistica → vista attiva.
- **AC-07** Storage key v3; payload v2 ignorato senza errori.
- **AC-08** `npm run build` e `npm test` verdi (ciclo RED→GREEN documentato).
