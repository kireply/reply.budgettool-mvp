---
spec_id: layout-viewport-fixed
status: approved
prd_ref: docs/prd/2026-06-11-layout-viewport-fixed.md
owner: p.prioriello
created: 2026-06-11
updated: 2026-06-11
---

# SPEC: Layout a viewport fisso

## Design

Solo `src/components/Layout.tsx`, solo stili inline (convenzione del progetto):

1. Contenitore root: `minHeight: '100vh'` → `height: '100vh'` + `overflow: 'hidden'`.
   Il root smette di crescere col contenuto; lo scroll di pagina sparisce.
2. `<aside>` (sidebar): aggiungere `overflowY: 'auto'` così su viewport molto
   bassi la sidebar scrolla internamente invece di essere tagliata.
3. Nessuna modifica a `<header>` (56px fissi) né a `<main>`: ha già
   `flex: 1, overflow: 'auto'` e diventa l'unica area scrollabile — su di esso
   si basa già lo scroll-to-error di `WBSNew.tsx` (`el.closest('main')`),
   che resta invariato.

## Acceptance Criteria

- **AC-01** Con contenuto più alto della finestra, sidebar e topbar restano
  fissi e scrolla solo `<main>` (nessuna scrollbar sul body).
- **AC-02** Il layout occupa il 100% dell'altezza della finestra a ogni
  dimensione; su viewport bassi la sidebar scrolla internamente.
- **AC-03** `npm run build` e `npm test` restano verdi; lo scroll-to-error del
  form Nuova WBS continua a funzionare (usa già lo scroll di `<main>`).

## Verifica

Modifica solo-CSS non coperta dal test-infra unit (niente DOM render): verifica
via build + smoke manuale in dev (Dashboard e lista PR con finestra ridotta).
