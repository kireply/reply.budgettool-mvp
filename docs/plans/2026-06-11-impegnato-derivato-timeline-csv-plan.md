---
plan_id: impegnato-derivato-timeline-csv
status: done
design_ref: docs/design/2026-06-11-impegnato-derivato-timeline-csv.md
prd_ref: docs/prd/2026-06-11-impegnato-derivato-timeline-csv.md
owner: p.prioriello
created: 2026-06-11
updated: 2026-06-11
sp_total: 8
critical_path: [T1, T2, T3, T4, T6]
---

# Piano Implementativo: Impegnato derivato dalle PR + Timeline stati PR + Export CSV

## Design & AC (SPEC inline)

Contesto: A2A Budget Tool MVP (prototipo React, dati mock, persistenza localStorage).
Problema: `WBS.impegnato` è un campo statico mai aggiornato dal workflow PR → due definizioni
divergenti di "disponibile" tra pagine; i bottoni Export sono morti; le PR non hanno storico stati.

Decisioni di design:
1. **Impegnato derivato**: rimuovere `WBS.impegnato`; nuova funzione `impegnatoOf(wbsId)` =
   Σ `importo` delle PR in stato `Approvata | Inviata a SAP | PO Creato` sulla WBS.
   Il budget check della pagina PR resta invariato (rolling − PR non rifiutate, anti-overcommit).
2. **Seed arricchito**: 13 PR seed (7 nuove) calibrate perché `impegnatoOf` restituisca i valori
   demo precedenti (185k/320k/95k/82k/198k/45k); rinumerate PR-2026-0001..0013 in ordine cronologico.
3. **Storia stati**: `PurchaseRequest.storia: StatusEvent[]` (`{stato, data}`); `updatePRStatus`
   appende; `addPurchaseRequest` parte da `[{Bozza, oggi}]`; seed generata con helper `storiaFor`.
   `STATUS_FLOW` si sposta in `mockData.ts` (era duplicato in `PurchaseRequests.tsx`).
4. **Modale dettaglio PR**: click su riga → modale (overlay nero 40%, card max 560px, animate-in
   300ms CDL) con anagrafica + timeline verticale degli stati; X / overlay / Chiudi per uscire.
5. **Export CSV**: util `src/utils/csv.ts` — `buildCsv` (pura, testabile: separatore `;` per Excel
   it-IT, escaping RFC4180, CRLF) + `downloadCsv` (BOM UTF-8, Blob + anchor). Wire su WBSList
   (righe filtrate) e Reportistica (dataset della vista attiva: area / scostamenti / trend).
6. **Storage key** → `a2a-budget-tool-data-v3` (cambio shape del seed).
7. **Test**: Vitest + jsdom (primo test-infra del progetto) su `impegnatoOf`, `updatePRStatus`
   (storia), `buildCsv`.

Acceptance Criteria:
- **AC-01** `impegnatoOf(wbsId)` somma solo PR `Approvata`/`Inviata a SAP`/`PO Creato` della WBS e riflette live i cambi di stato.
- **AC-02** Il campo statico `WBS.impegnato` non esiste più; Dashboard, WBSList, WBSDetail, Reportistica usano `impegnatoOf`.
- **AC-03** Con il seed, `impegnatoOf` restituisce: wbs-001=185000, wbs-002=320000, wbs-003=95000, wbs-004=82000, wbs-005=198000, wbs-006=45000.
- **AC-04** Ogni PR ha `storia`; `updatePRStatus` appende `{stato, data:oggi}`; le nuove PR nascono con storia `[{Bozza, oggi}]`.
- **AC-05** Click su una riga PR apre la modale con anagrafica e timeline stati; le azioni avanza/rifiuta non aprono la modale (stopPropagation).
- **AC-06** I bottoni Export scaricano un CSV (`;`, BOM, CRLF) con intestazioni tradotte: WBSList → righe filtrate; Reportistica → dataset vista attiva.
- **AC-07** Storage key bumpata a v3; dati v2 ignorati senza errori.
- **AC-08** `npm run build` verde; test Vitest verdi (RED→GREEN documentato dal flusso tdd).

## Pre-requisiti
- Branch di lavoro (repo attualmente su `main`, working tree pulito).
- `npm install -D vitest jsdom` per il test-infra.

## Task

### T1: Setup Vitest + test RED sul data layer
**AC**: AC-01, AC-03, AC-04, AC-08 · **Dipendenze**: nessuna
**File**: `package.json`, `src/data/mockData.test.ts`, `src/utils/csv.test.ts`
Installare vitest+jsdom, script `"test": "vitest run"`; scrivere i test per `impegnatoOf` (filtra stati, somma corretta sul seed), `updatePRStatus` (stato aggiornato + evento appeso), `buildCsv` (separatore, escaping, CRLF). Output atteso: test falliscono (RED) perché le API non esistono.

### T2: Data layer — tipi, seed, impegnatoOf, storia, v3
**AC**: AC-01, AC-02, AC-03, AC-04, AC-07 · **Dipendenze**: T1
**File**: `src/data/mockData.ts`
Rimuovere `impegnato` da `WBS` (interfaccia + 6 seed); aggiungere `StatusEvent`, `storia`, `STATUS_FLOW` esportato, helper `storiaFor`/`addDays`, seed 13 PR rinumerate, `impegnatoOf`, append storia in `updatePRStatus`, STORAGE_KEY v3. Output atteso: test T1 verdi (GREEN).

### T3: Util CSV
**AC**: AC-06, AC-08 · **Dipendenze**: T1
**File**: `src/utils/csv.ts`
`buildCsv(headers, rows)` pura + `downloadCsv(filename, headers, rows)` con BOM/Blob/anchor. Output atteso: test csv verdi.

### T4: Pagine — sostituire w.impegnato con impegnatoOf
**AC**: AC-02 · **Dipendenze**: T2
**File**: `src/pages/Dashboard.tsx`, `src/pages/WBSList.tsx`, `src/pages/WBSDetail.tsx`, `src/pages/Reportistica.tsx`, `src/pages/WBSNew.tsx`
Import e uso di `impegnatoOf`; rimozione `impegnato: 0` da WBSNew. Output atteso: `tsc` non segnala più riferimenti al campo rimosso.

### T5: Export CSV su WBSList e Reportistica
**AC**: AC-06 · **Dipendenze**: T3, T4
**File**: `src/pages/WBSList.tsx`, `src/pages/Reportistica.tsx`
onClick sui bottoni Export esistenti; intestazioni via `t()`; Reportistica esporta il dataset della vista attiva. Output atteso: click → download file CSV apribile in Excel.

### T6: Modale dettaglio PR con timeline
**AC**: AC-04, AC-05 · **Dipendenze**: T2
**File**: `src/pages/PurchaseRequests.tsx`
Import `STATUS_FLOW` da mockData (rimozione costante locale); `storia` alla creazione; stato `selectedPR`; riga cliccabile + stopPropagation sulle azioni; modale CDL con anagrafica, note e timeline verticale. Output atteso: modale funzionante in dev.

### T7: Traduzioni
**AC**: AC-05, AC-06 · **Dipendenze**: nessuna
**File**: `src/translations.ts`
Nuove chiavi ×4 lingue: `pr.detailTitle`, `pr.timeline`, `pr.creatore`, `common.close`; `wbs.export` → "Export CSV". Output atteso: nessuna chiave mancante a runtime.

### T8: Documentazione
**AC**: N/A (operational) · **Dipendenze**: T2-T6
**File**: `CLAUDE.md`
Aggiornare: impegnato derivato, storia PR, storage v3, util CSV, test Vitest; correggere la nota "session-only" e il riferimento al PRD rimosso. Output atteso: CLAUDE.md coerente col codice.

### T9: Verifica finale
**AC**: AC-08 · **Dipendenze**: tutti
Eseguire `npm test` e `npm run build`. Output atteso: entrambi verdi.

## Grafo dipendenze
```
T1 ──→ T2 ──→ T4 ──→ T5
T1 ──→ T3 ──→ T5      T6 (da T2)
T7 (indipendente)     T8 (da T2-T6) ──→ T9
```
Percorso critico: T1 → T2 → T4 → T5 → T9.

## Checkpoint Plan
- [x] Checkpoint 1: dopo T1-T3 (data layer GREEN — 8/8 test)
- [x] Checkpoint 2: dopo T4-T6 (UI integrata)
- [x] Checkpoint 3: T9 verifica finale

## Verifica Finale
- [x] Tutti i task completati (T1–T9)
- [x] Test passano (`npm test`: 8/8, 2026-06-11)
- [x] Build verde (`npm run build`: ok in 5.0s, 2026-06-11)
- [x] Review pronta
