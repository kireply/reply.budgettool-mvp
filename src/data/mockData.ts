export type Scenario = 'Budget' | 'Rolling' | 'Forecast' | 'Actual';
export type PRStatus = 'Bozza' | 'Inviata' | 'Approvata' | 'Rifiutata' | 'Inviata a SAP' | 'PO Creato';
export type CostType = 'Opex' | 'Capex';

export interface MonthlyData {
  month: string;
  budget: number;
  rolling: number;
  actual: number;
}

export interface CostEntry {
  voce: string;
  tipo: CostType;
  budget: number;
  rolling: number;
  actual: number;
  monthly: MonthlyData[];
}

export interface WBS {
  id: string;
  codice: string;
  nome: string;
  responsabile: string;
  area: string;
  centroCosto: string;
  legalEntity: string;
  fornitore: string;
  anno: number;
  stato: 'Attiva' | 'Chiusa' | 'Sospesa';
  budgetTotale: number;
  rollingTotale: number;
  actual: number;
  costi: CostEntry[];
  budgetLineId: string;
}

export const STATUS_FLOW: PRStatus[] = ['Bozza', 'Inviata', 'Approvata', 'Inviata a SAP', 'PO Creato'];

export interface StatusEvent {
  stato: PRStatus;
  data: string;
}

export interface PurchaseRequest {
  id: string;
  numero: string;
  wbsId: string;
  wbsCodice: string;
  wbsNome: string;
  voceCosto: string;
  fornitore: string;
  importo: number;
  stato: PRStatus;
  creatore: string;
  dataCreazione: string;
  note: string;
  storia: StatusEvent[];
}

export interface Accertamento {
  id: string;
  wbsId: string;
  voceCosto: string;
  mese: string;
  anno: number;
  importo: number;
  note: string;
  creatore: string;
  dataCreazione: string;
}

export type EMStato = 'Pianificata' | 'Confermata' | 'Ricevuta SAP';

export interface EntrataMerciPianificata {
  id: string;
  wbsId: string;
  voceCosto: string;
  fornitore: string;
  dataPrevista: string;
  importo: number;
  stato: EMStato;
  note: string;
  creatore: string;
  dataCreazione: string;
}

export interface BudgetLine {
  id: string;
  codice: string;
  nome: string;
  area: string;
  responsabile: string;
  anno: number;
  budgetTotale: number;
}

export const MONTHS = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

function monthlySpread(total: number, variance = 0.2): MonthlyData[] {
  return MONTHS.map((month, i) => {
    const base = total / 12;
    const factor = 1 + (Math.sin(i) * variance);
    return {
      month,
      budget: Math.round(base * factor),
      rolling: Math.round(base * factor * 1.05),
      actual: i < 5 ? Math.round(base * factor * 0.95) : 0,
    };
  });
}

export const wbsData: WBS[] = [
  {
    id: 'wbs-001',
    codice: 'IT-2026-001',
    nome: 'Infrastruttura Cloud AWS',
    responsabile: 'Marco Bianchi',
    area: 'IT Infrastructure',
    centroCosto: 'CC-IT-001',
    legalEntity: 'Reply S.p.A.',
    fornitore: 'Amazon Web Services',
    anno: 2026,
    stato: 'Attiva',
    budgetTotale: 480000,
    rollingTotale: 504000,
    actual: 142000,
    budgetLineId: 'bl-001',
    costi: [
      { voce: 'Licenze Software', tipo: 'Opex', budget: 120000, rolling: 126000, actual: 48000, monthly: monthlySpread(120000) },
      { voce: 'Servizi Cloud', tipo: 'Opex', budget: 240000, rolling: 252000, actual: 78000, monthly: monthlySpread(240000, 0.3) },
      { voce: 'Hardware', tipo: 'Capex', budget: 120000, rolling: 126000, actual: 16000, monthly: monthlySpread(120000, 0.4) },
    ],
  },
  {
    id: 'wbs-002',
    codice: 'IT-2026-002',
    nome: 'Progetto SAP S/4HANA Migration',
    responsabile: 'Laura Verdi',
    area: 'Application Management',
    centroCosto: 'CC-IT-002',
    legalEntity: 'Reply S.p.A.',
    fornitore: 'SAP Italia',
    anno: 2026,
    stato: 'Attiva',
    budgetTotale: 750000,
    rollingTotale: 787500,
    actual: 265000,
    budgetLineId: 'bl-002',
    costi: [
      { voce: 'Consulenza Esterna', tipo: 'Capex', budget: 450000, rolling: 472500, actual: 187000, monthly: monthlySpread(450000, 0.1) },
      { voce: 'Licenze SAP', tipo: 'Opex', budget: 200000, rolling: 210000, actual: 68000, monthly: monthlySpread(200000, 0.05) },
      { voce: 'Formazione', tipo: 'Opex', budget: 100000, rolling: 105000, actual: 10000, monthly: monthlySpread(100000, 0.5) },
    ],
  },
  {
    id: 'wbs-003',
    codice: 'IT-2026-003',
    nome: 'Sicurezza Informatica & SOC',
    responsabile: 'Alessandro Neri',
    area: 'Cybersecurity',
    centroCosto: 'CC-IT-003',
    legalEntity: 'Reply S.p.A.',
    fornitore: 'Leonardo S.p.A.',
    anno: 2026,
    stato: 'Attiva',
    budgetTotale: 320000,
    rollingTotale: 336000,
    actual: 78000,
    budgetLineId: 'bl-003',
    costi: [
      { voce: 'Servizi SOC Gestito', tipo: 'Opex', budget: 180000, rolling: 189000, actual: 58000, monthly: monthlySpread(180000) },
      { voce: 'Tool SIEM', tipo: 'Opex', budget: 90000, rolling: 94500, actual: 15000, monthly: monthlySpread(90000, 0.1) },
      { voce: 'Firewall / HW Security', tipo: 'Capex', budget: 50000, rolling: 52500, actual: 5000, monthly: monthlySpread(50000, 0.7) },
    ],
  },
  {
    id: 'wbs-004',
    codice: 'IT-2026-004',
    nome: 'Digital Workplace & Collaboration',
    responsabile: 'Francesca Romano',
    area: 'Digital Workplace',
    centroCosto: 'CC-IT-004',
    legalEntity: 'Reply Energia S.r.l.',
    fornitore: 'Microsoft Italia',
    anno: 2026,
    stato: 'Attiva',
    budgetTotale: 210000,
    rollingTotale: 220500,
    actual: 67500,
    budgetLineId: 'bl-004',
    costi: [
      { voce: 'Microsoft 365', tipo: 'Opex', budget: 120000, rolling: 126000, actual: 50000, monthly: monthlySpread(120000, 0.05) },
      { voce: 'Device Management', tipo: 'Capex', budget: 60000, rolling: 63000, actual: 12000, monthly: monthlySpread(60000, 0.3) },
      { voce: 'Collaborazione & Video', tipo: 'Opex', budget: 30000, rolling: 31500, actual: 5500, monthly: monthlySpread(30000, 0.2) },
    ],
  },
  {
    id: 'wbs-005',
    codice: 'IT-2026-005',
    nome: 'Data Platform & Analytics',
    responsabile: 'Stefano Conti',
    area: 'Data & Analytics',
    centroCosto: 'CC-IT-005',
    legalEntity: 'Reply Smart City S.r.l.',
    fornitore: 'Capgemini Italia',
    anno: 2026,
    stato: 'Attiva',
    budgetTotale: 560000,
    rollingTotale: 588000,
    actual: 154000,
    budgetLineId: 'bl-005',
    costi: [
      { voce: 'Data Engineering', tipo: 'Capex', budget: 280000, rolling: 294000, actual: 98000, monthly: monthlySpread(280000, 0.15) },
      { voce: 'BI & Reporting', tipo: 'Opex', budget: 160000, rolling: 168000, actual: 42000, monthly: monthlySpread(160000, 0.2) },
      { voce: 'AI/ML Platform', tipo: 'Capex', budget: 120000, rolling: 126000, actual: 14000, monthly: monthlySpread(120000, 0.6) },
    ],
  },
  {
    id: 'wbs-006',
    codice: 'IT-2026-006',
    nome: 'Network & Connettività',
    responsabile: 'Roberto Esposito',
    area: 'IT Infrastructure',
    centroCosto: 'CC-IT-001',
    legalEntity: 'Reply S.p.A.',
    fornitore: 'TIM Enterprise',
    anno: 2026,
    stato: 'Sospesa',
    budgetTotale: 180000,
    rollingTotale: 189000,
    actual: 38000,
    budgetLineId: 'bl-001',
    costi: [
      { voce: 'Circuiti WAN', tipo: 'Opex', budget: 120000, rolling: 126000, actual: 30000, monthly: monthlySpread(120000, 0.05) },
      { voce: 'SD-WAN Upgrade', tipo: 'Capex', budget: 60000, rolling: 63000, actual: 8000, monthly: monthlySpread(60000, 0.8) },
    ],
  },
];

export const budgetLines: BudgetLine[] = [
  { id: 'bl-001', codice: 'BL-2026-001', nome: 'Modernizzazione Infrastruttura IT', area: 'IT Infrastructure', responsabile: 'Marco Bianchi', anno: 2026, budgetTotale: 660000 },
  { id: 'bl-002', codice: 'BL-2026-002', nome: 'Trasformazione ERP SAP S/4HANA', area: 'Application Management', responsabile: 'Laura Verdi', anno: 2026, budgetTotale: 750000 },
  { id: 'bl-003', codice: 'BL-2026-003', nome: 'Sicurezza & Cyber Resilienza', area: 'Cybersecurity', responsabile: 'Alessandro Neri', anno: 2026, budgetTotale: 320000 },
  { id: 'bl-004', codice: 'BL-2026-004', nome: 'Digital Workplace 2026', area: 'Digital Workplace', responsabile: 'Francesca Romano', anno: 2026, budgetTotale: 210000 },
  { id: 'bl-005', codice: 'BL-2026-005', nome: 'Data Platform & Analytics', area: 'Data & Analytics', responsabile: 'Stefano Conti', anno: 2026, budgetTotale: 560000 },
];

function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

function storiaFor(finale: PRStatus, creata: string): StatusEvent[] {
  const chain: PRStatus[] = finale === 'Rifiutata'
    ? ['Bozza', 'Inviata', 'Rifiutata']
    : STATUS_FLOW.slice(0, STATUS_FLOW.indexOf(finale) + 1);
  const offsets = [0, 4, 9, 13, 18];
  return chain.map((stato, i) => ({ stato, data: addDays(creata, offsets[i]) }));
}

function seedPR(
  n: number, wbs: WBS, voceCosto: string, fornitore: string, importo: number,
  stato: PRStatus, dataCreazione: string, note: string,
): PurchaseRequest {
  return {
    id: `pr-${String(n).padStart(3, '0')}`,
    numero: `PR-2026-${String(n).padStart(4, '0')}`,
    wbsId: wbs.id, wbsCodice: wbs.codice, wbsNome: wbs.nome,
    voceCosto, fornitore, importo, stato,
    creatore: wbs.responsabile, dataCreazione, note,
    storia: storiaFor(stato, dataCreazione),
  };
}

// Seed calibrato: per ogni WBS la somma delle PR confermate (Approvata /
// Inviata a SAP / PO Creato) riproduce i valori demo storici di impegnato
// (185k / 320k / 95k / 82k / 198k / 45k). Numerazione in ordine cronologico.
export const purchaseRequests: PurchaseRequest[] = [
  seedPR(1, wbsData[2], 'Servizi SOC Gestito', 'Leonardo S.p.A.', 45000, 'Approvata', '2026-01-20', 'Servizi SOC H1 2026'),
  seedPR(2, wbsData[0], 'Licenze Software', 'Amazon Web Services', 100000, 'PO Creato', '2026-01-28', 'Rinnovo licenze annuali piattaforma'),
  seedPR(3, wbsData[3], 'Microsoft 365', 'Microsoft Italia', 82000, 'PO Creato', '2026-02-03', 'Rinnovo tenant M365 E3'),
  seedPR(4, wbsData[0], 'Servizi Cloud', 'Amazon Web Services', 85000, 'Approvata', '2026-02-15', 'Rinnovo contratto AWS EC2 - Q1'),
  seedPR(5, wbsData[4], 'Data Engineering', 'Capgemini Italia', 110000, 'Approvata', '2026-02-24', 'Sprint 1-2 Data Lake'),
  seedPR(6, wbsData[1], 'Consulenza Esterna', 'SAP Italia', 150000, 'Inviata a SAP', '2026-03-01', 'Fase 1 implementazione FICO'),
  seedPR(7, wbsData[5], 'Circuiti WAN', 'TIM Enterprise', 45000, 'PO Creato', '2026-03-09', 'Canoni circuiti WAN H1'),
  seedPR(8, wbsData[1], 'Licenze SAP', 'SAP Italia', 170000, 'PO Creato', '2026-03-16', 'Licenze S/4HANA — primo lotto'),
  seedPR(9, wbsData[1], 'Formazione', 'SAP Italia', 25000, 'Rifiutata', '2026-03-20', 'Training SAP HANA admin — rifiutata: fuori budget'),
  seedPR(10, wbsData[2], 'Tool SIEM', 'Leonardo S.p.A.', 50000, 'Approvata', '2026-03-27', 'Estensione licenza SIEM'),
  seedPR(11, wbsData[4], 'BI & Reporting', 'Capgemini Italia', 88000, 'PO Creato', '2026-04-02', 'Sviluppo dashboard direzionali'),
  seedPR(12, wbsData[4], 'Data Engineering', 'Capgemini Italia', 98000, 'Inviata', '2026-04-10', 'Sprint 3-4 Data Lake'),
  seedPR(13, wbsData[3], 'Device Management', 'TBD', 12000, 'Bozza', '2026-05-05', 'Acquisto laptop Q2'),
];

// Accertamenti mensili: stime manuali di lavoro eseguito non ancora fatturato.
// Rappresentano la quota "accertato" del consuntivo (Actual SAP + Accertato = Consuntivo Totale).
export const accertamenti: Accertamento[] = [
  { id: 'acc-001', wbsId: 'wbs-001', voceCosto: 'Licenze Software', mese: 'Gen', anno: 2026, importo: 8000, note: 'Rateo mensile canoni licenza', creatore: 'Marco Bianchi', dataCreazione: '2026-01-31' },
  { id: 'acc-002', wbsId: 'wbs-001', voceCosto: 'Servizi Cloud', mese: 'Apr', anno: 2026, importo: 12500, note: 'Avanzamento deployment Q2 — stima 35%', creatore: 'Marco Bianchi', dataCreazione: '2026-04-30' },
  { id: 'acc-003', wbsId: 'wbs-001', voceCosto: 'Licenze Software', mese: 'Mag', anno: 2026, importo: 9000, note: 'Rateo mensile canoni licenza', creatore: 'Marco Bianchi', dataCreazione: '2026-05-31' },
  { id: 'acc-004', wbsId: 'wbs-002', voceCosto: 'Consulenza Esterna', mese: 'Mar', anno: 2026, importo: 22000, note: 'Milestone M1 — avanzamento parziale', creatore: 'Laura Verdi', dataCreazione: '2026-03-31' },
  { id: 'acc-005', wbsId: 'wbs-002', voceCosto: 'Consulenza Esterna', mese: 'Mag', anno: 2026, importo: 18000, note: 'Avanzamento fase FICO — stima 40%', creatore: 'Laura Verdi', dataCreazione: '2026-05-31' },
  { id: 'acc-006', wbsId: 'wbs-004', voceCosto: 'Microsoft 365', mese: 'Apr', anno: 2026, importo: 7500, note: 'Rateo utenze Q2', creatore: 'Francesca Romano', dataCreazione: '2026-04-30' },
  { id: 'acc-007', wbsId: 'wbs-005', voceCosto: 'Data Engineering', mese: 'Mar', anno: 2026, importo: 15000, note: 'Sprint 1-2 — accertamento parziale', creatore: 'Stefano Conti', dataCreazione: '2026-03-31' },
  { id: 'acc-008', wbsId: 'wbs-005', voceCosto: 'BI & Reporting', mese: 'Mag', anno: 2026, importo: 11000, note: 'Dashboard direzionali — avanzamento 40%', creatore: 'Stefano Conti', dataCreazione: '2026-05-31' },
];

// Entrate merci pianificate: goods receipt futuri già pianificati dai gestori operativi.
export const entrateMerciPianificate: EntrataMerciPianificata[] = [
  { id: 'emp-001', wbsId: 'wbs-001', voceCosto: 'Servizi Cloud', fornitore: 'Amazon Web Services', dataPrevista: '2026-07-15', importo: 45000, stato: 'Pianificata', note: 'Rinnovo contratto AWS EC2 — Q3', creatore: 'Marco Bianchi', dataCreazione: '2026-05-20' },
  { id: 'emp-002', wbsId: 'wbs-002', voceCosto: 'Consulenza Esterna', fornitore: 'SAP Italia', dataPrevista: '2026-08-01', importo: 80000, stato: 'Confermata', note: 'Fase 2 implementazione — milestone confermata', creatore: 'Laura Verdi', dataCreazione: '2026-05-15' },
  { id: 'emp-003', wbsId: 'wbs-003', voceCosto: 'Servizi SOC Gestito', fornitore: 'Leonardo S.p.A.', dataPrevista: '2026-09-01', importo: 30000, stato: 'Pianificata', note: 'Servizi SOC H2 2026 — primo lotto', creatore: 'Alessandro Neri', dataCreazione: '2026-05-10' },
  { id: 'emp-004', wbsId: 'wbs-005', voceCosto: 'Data Engineering', fornitore: 'Capgemini Italia', dataPrevista: '2026-06-30', importo: 55000, stato: 'Pianificata', note: 'Sprint 3-4 Data Lake — consegna fine giugno', creatore: 'Stefano Conti', dataCreazione: '2026-05-25' },
];

// ---- Persistence (localStorage) ----
// v5: added budgetLineId to WBS, added budgetLines array
const STORAGE_KEY = 'a2a-budget-tool-data-v5';

interface PersistedData {
  wbs: WBS[];
  prs: PurchaseRequest[];
  accertamenti: Accertamento[];
  emp: EntrataMerciPianificata[];
}

function persist(): void {
  try {
    const data: PersistedData = {
      wbs: wbsData, prs: purchaseRequests,
      accertamenti, emp: entrateMerciPianificate,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable: the app keeps working without persistence
  }
}

function hydrate(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw) as PersistedData;
    if (Array.isArray(data.wbs) && Array.isArray(data.prs)) {
      wbsData.splice(0, wbsData.length, ...data.wbs);
      purchaseRequests.splice(0, purchaseRequests.length, ...data.prs);
      if (Array.isArray(data.accertamenti)) {
        accertamenti.splice(0, accertamenti.length, ...data.accertamenti);
      }
      if (Array.isArray(data.emp)) {
        entrateMerciPianificate.splice(0, entrateMerciPianificate.length, ...data.emp);
      }
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

hydrate();

export function addWBS(wbs: WBS): void {
  wbsData.push(wbs);
  persist();
}

export function addPurchaseRequest(pr: PurchaseRequest): void {
  purchaseRequests.unshift(pr);
  persist();
}

export function updatePRStatus(id: string, stato: PRStatus): void {
  const pr = purchaseRequests.find(p => p.id === id);
  if (pr) {
    pr.stato = stato;
    pr.storia = [...(pr.storia ?? []), { stato, data: new Date().toISOString().split('T')[0] }];
    persist();
  }
}

export function addAccertamento(a: Accertamento): void {
  accertamenti.unshift(a);
  persist();
}

export function accertatoOf(wbsId: string): number {
  return accertamenti
    .filter(a => a.wbsId === wbsId)
    .reduce((s, a) => s + a.importo, 0);
}

export function accertatoByVoce(wbsId: string, voceCosto: string): number {
  return accertamenti
    .filter(a => a.wbsId === wbsId && a.voceCosto === voceCosto)
    .reduce((s, a) => s + a.importo, 0);
}

export function addEMP(e: EntrataMerciPianificata): void {
  entrateMerciPianificate.unshift(e);
  persist();
}

export function updateEMPStato(id: string, stato: EMStato): void {
  const emp = entrateMerciPianificate.find(e => e.id === id);
  if (emp) {
    emp.stato = stato;
    persist();
  }
}

const COMMITTED_STATES: PRStatus[] = ['Approvata', 'Inviata a SAP', 'PO Creato'];

export function impegnatoOf(wbsId: string): number {
  return purchaseRequests
    .filter(p => p.wbsId === wbsId && COMMITTED_STATES.includes(p.stato))
    .reduce((s, p) => s + p.importo, 0);
}

export function resetDemoData(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}

// Derived AFTER hydration so persisted entries are included
export const areas = [...new Set(wbsData.map(w => w.area))];
export const years = [2025, 2026, 2027];
export const legalEntities = ['Reply S.p.A.', 'Reply Energia S.r.l.', 'Reply Smart City S.r.l.'];

export const vociCosto = [
  'Licenze Software', 'Servizi Cloud', 'Hardware', 'Consulenza Esterna',
  'Licenze SAP', 'Formazione', 'Servizi SOC Gestito', 'Tool SIEM',
  'Firewall / HW Security', 'Microsoft 365', 'Device Management',
  'Collaborazione & Video', 'Data Engineering', 'BI & Reporting', 'AI/ML Platform',
  'Circuiti WAN', 'SD-WAN Upgrade'
];

export const fornitori = [
  'Amazon Web Services', 'SAP Italia', 'Leonardo S.p.A.', 'Microsoft Italia',
  'Capgemini Italia', 'TIM Enterprise', 'Reply S.p.A.', 'Accenture Italia', 'TBD'
];

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

export function getStatusColor(stato: PRStatus): string {
  const map: Record<PRStatus, string> = {
    'Bozza': 'badge badge-draft',
    'Inviata': 'badge badge-sent',
    'Approvata': 'badge badge-approved',
    'Rifiutata': 'badge badge-rejected',
    'Inviata a SAP': 'badge badge-sap',
    'PO Creato': 'badge badge-po',
  };
  return map[stato] || 'badge badge-draft';
}

export function getWBSStatusColor(stato: WBS['stato']): string {
  const map = {
    'Attiva': 'badge badge-approved',
    'Chiusa': 'badge badge-draft',
    'Sospesa': 'badge badge-sent',
  };
  return map[stato];
}

export function getEMPStatusColor(stato: EMStato): string {
  const map: Record<EMStato, string> = {
    'Pianificata': 'badge badge-sent',
    'Confermata': 'badge badge-approved',
    'Ricevuta SAP': 'badge badge-sap',
  };
  return map[stato];
}
