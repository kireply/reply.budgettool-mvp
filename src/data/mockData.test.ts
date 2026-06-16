import { describe, it, expect } from 'vitest';
import {
  purchaseRequests, impegnatoOf, addPurchaseRequest, updatePRStatus,
  budgetLines, wbsData, accertatoByVoce,
  type PurchaseRequest,
} from './mockData';

function makePR(id: string, wbsId: string, importo: number): PurchaseRequest {
  return {
    id,
    numero: `PR-2026-${id}`,
    wbsId,
    wbsCodice: 'IT-2026-TEST',
    wbsNome: 'WBS di test',
    voceCosto: 'Licenze Software',
    fornitore: 'TBD',
    importo,
    stato: 'Bozza',
    creatore: 'Test',
    dataCreazione: '2026-06-11',
    note: '',
    storia: [{ stato: 'Bozza', data: '2026-06-11' }],
  };
}

describe('impegnatoOf', () => {
  it('should sommare solo le PR confermate del seed (Approvata / Inviata a SAP / PO Creato)', () => {
    // AC-03: il seed è calibrato sui valori demo storici
    expect(impegnatoOf('wbs-001')).toBe(185000);
    expect(impegnatoOf('wbs-002')).toBe(320000); // la PR Rifiutata da 25k è esclusa
    expect(impegnatoOf('wbs-003')).toBe(95000);
    expect(impegnatoOf('wbs-004')).toBe(82000);  // la Bozza da 12k è esclusa
    expect(impegnatoOf('wbs-005')).toBe(198000); // la Inviata da 98k è esclusa
    expect(impegnatoOf('wbs-006')).toBe(45000);
  });

  it('should restituire 0 per una WBS senza PR confermate', () => {
    expect(impegnatoOf('wbs-inesistente')).toBe(0);
  });

  it('should riflettere live i cambi di stato delle PR', () => {
    const base = impegnatoOf('wbs-001');
    addPurchaseRequest(makePR('test-live', 'wbs-001', 10000));

    // Bozza e Inviata non impegnano budget
    expect(impegnatoOf('wbs-001')).toBe(base);
    updatePRStatus('test-live', 'Inviata');
    expect(impegnatoOf('wbs-001')).toBe(base);

    // Approvata sì; Rifiutata torna a liberare
    updatePRStatus('test-live', 'Approvata');
    expect(impegnatoOf('wbs-001')).toBe(base + 10000);
    updatePRStatus('test-live', 'Rifiutata');
    expect(impegnatoOf('wbs-001')).toBe(base);
  });
});

describe('budgetLines', () => {
  it('should esportare un array di 5 righe di budget con id univoci', () => {
    expect(budgetLines).toHaveLength(5);
    const ids = budgetLines.map(bl => bl.id);
    expect(new Set(ids).size).toBe(5);
  });

  it('should avere ogni WBS seed con budgetLineId che punta a una BudgetLine esistente', () => {
    const blIds = new Set(budgetLines.map(bl => bl.id));
    const seedWbs = wbsData.filter(w => w.id.startsWith('wbs-00'));
    for (const wbs of seedWbs) {
      expect(blIds.has(wbs.budgetLineId),
        `wbs ${wbs.id} ha budgetLineId='${wbs.budgetLineId}' non presente in budgetLines`
      ).toBe(true);
    }
  });
});

describe('accertatoByVoce', () => {
  it('should sommare gli accertamenti filtrati per wbsId e voceCosto', () => {
    // acc-001 (8000) + acc-003 (9000) = 17000
    expect(accertatoByVoce('wbs-001', 'Licenze Software')).toBe(17000);
    // acc-002 (12500)
    expect(accertatoByVoce('wbs-001', 'Servizi Cloud')).toBe(12500);
    // acc-004 (22000) + acc-005 (18000) = 40000
    expect(accertatoByVoce('wbs-002', 'Consulenza Esterna')).toBe(40000);
  });

  it('should restituire 0 per wbs o voce senza accertamenti', () => {
    expect(accertatoByVoce('wbs-999', 'Qualsiasi')).toBe(0);
    expect(accertatoByVoce('wbs-001', 'Voce Inesistente')).toBe(0);
  });
});

describe('storia delle PR', () => {
  it('should avere nel seed una storia coerente: parte da Bozza e termina nello stato corrente', () => {
    for (const pr of purchaseRequests.filter(p => !p.id.startsWith('test-'))) {
      expect(pr.storia.length).toBeGreaterThan(0);
      expect(pr.storia[0].stato).toBe('Bozza');
      expect(pr.storia[0].data).toBe(pr.dataCreazione);
      expect(pr.storia[pr.storia.length - 1].stato).toBe(pr.stato);
    }
  });

  it('should appendere un evento datato ad ogni updatePRStatus', () => {
    addPurchaseRequest(makePR('test-storia', 'wbs-003', 5000));
    updatePRStatus('test-storia', 'Inviata');
    updatePRStatus('test-storia', 'Approvata');

    const pr = purchaseRequests.find(p => p.id === 'test-storia')!;
    expect(pr.stato).toBe('Approvata');
    expect(pr.storia.map(e => e.stato)).toEqual(['Bozza', 'Inviata', 'Approvata']);
    expect(pr.storia[2].data).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
