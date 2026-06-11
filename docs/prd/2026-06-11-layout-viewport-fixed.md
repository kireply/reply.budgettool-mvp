---
prd_id: layout-viewport-fixed
status: approved
owner: p.prioriello
created: 2026-06-11
updated: 2026-06-11
---

# PRD: Layout a viewport fisso (scroll solo sul contenuto)

## Problema

Il layout dell'app usa `minHeight: 100vh` sul contenitore root: quando il
contenuto di pagina supera l'altezza della finestra scrolla l'intera pagina,
trascinando anche sidebar e topbar fuori dallo schermo.

## Obiettivo

- **OB-1** Il layout occupa esattamente il 100% dell'altezza della finestra.
- **OB-2** Sidebar e topbar restano sempre visibili; scrolla solo il contenuto
  della pagina (`<main>`).
- **OB-3** Su finestre molto basse la sidebar scrolla internamente senza
  tagliare le voci di navigazione.

## Riferimenti

Richiesta esplicita dell'utente in chat 2026-06-11 ("fai in modo che il layout
occupi 100vh e che scorra solo il contenuto, non header e sidebar").
