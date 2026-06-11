---
prd_id: impegnato-derivato-timeline-csv
status: approved
owner: p.prioriello
created: 2026-06-11
updated: 2026-06-11
---

# PRD: Impegnato derivato dalle PR, timeline stati PR, export CSV

## Contesto

A2A Budget Tool MVP — prototipo React per la gestione del ciclo budget IT
(WBS, Purchase Request, reportistica), dati mock con persistenza localStorage.
Da un assessment del codice (chat 2026-06-11) emergono tre gap che riducono
la credibilità della demo davanti al cliente.

## Problemi

1. **L'impegnato non vive.** `WBS.impegnato` è un campo statico del seed mai
   aggiornato dal workflow PR: portare una PR fino a "PO Creato" non muove
   KPI, barre di utilizzo né reportistica. Esistono inoltre due definizioni
   divergenti di "disponibile" tra la pagina PR e le altre viste.
2. **Nessun audit trail sulle PR.** Il processo approvativo (Bozza → … → PO
   Creato) è il cuore del PRD originale, ma le transizioni non lasciano traccia.
3. **Bottoni Export morti.** "Export Excel" (Gestione WBS) e "Export
   Excel/CSV" (Reportistica) non fanno nulla: primo punto dove un utente
   demo clicca e resta deluso.

## Obiettivi (cosa + perché)

- **OB-1** Il valore "impegnato" di ogni WBS deriva dalle PR confermate, così
  il ciclo WBS → PR → impegno è visibile end-to-end in demo.
- **OB-2** Ogni PR mantiene lo storico delle transizioni di stato, consultabile
  da un dettaglio PR, per simulare l'audit trail SAP.
- **OB-3** I bottoni Export producono un CSV reale apribile in Excel (locale it).
- **OB-4** I valori demo del dashboard restano ricchi e plausibili (seed calibrato).

## Non-obiettivi

- Nessun backend o integrazione SAP reale (resta un prototipo mock).
- Nessuna gestione ruoli/permessi (richiedente vs approvatore) in questo ciclo.
- Nessun export XLSX nativo: CSV compatibile Excel è sufficiente per l'MVP.

## Riferimenti

- Assessment in chat 2026-06-11 (questa sessione Claude Code).
- Il PRD originale del tool (`prd_structured.txt`) non è più presente nel repo.
