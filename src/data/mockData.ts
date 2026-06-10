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
  impegnato: number;
  actual: number;
  costi: CostEntry[];
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
    codice: 'IT-2025-001',
    nome: 'Infrastruttura Cloud AWS',
    responsabile: 'Marco Bianchi',
    area: 'IT Infrastructure',
    centroCosto: 'CC-IT-001',
    legalEntity: 'A2A S.p.A.',
    fornitore: 'Amazon Web Services',
    anno: 2025,
    stato: 'Attiva',
    budgetTotale: 480000,
    rollingTotale: 504000,
    impegnato: 185000,
    actual: 142000,
    costi: [
      { voce: 'Licenze Software', tipo: 'Opex', budget: 120000, rolling: 126000, actual: 48000, monthly: monthlySpread(120000) },
      { voce: 'Servizi Cloud', tipo: 'Opex', budget: 240000, rolling: 252000, actual: 78000, monthly: monthlySpread(240000, 0.3) },
      { voce: 'Hardware', tipo: 'Capex', budget: 120000, rolling: 126000, actual: 16000, monthly: monthlySpread(120000, 0.4) },
    ],
  },
  {
    id: 'wbs-002',
    codice: 'IT-2025-002',
    nome: 'Progetto SAP S/4HANA Migration',
    responsabile: 'Laura Verdi',
    area: 'Application Management',
    centroCosto: 'CC-IT-002',
    legalEntity: 'A2A S.p.A.',
    fornitore: 'SAP Italia',
    anno: 2025,
    stato: 'Attiva',
    budgetTotale: 750000,
    rollingTotale: 787500,
    impegnato: 320000,
    actual: 265000,
    costi: [
      { voce: 'Consulenza Esterna', tipo: 'Capex', budget: 450000, rolling: 472500, actual: 187000, monthly: monthlySpread(450000, 0.1) },
      { voce: 'Licenze SAP', tipo: 'Opex', budget: 200000, rolling: 210000, actual: 68000, monthly: monthlySpread(200000, 0.05) },
      { voce: 'Formazione', tipo: 'Opex', budget: 100000, rolling: 105000, actual: 10000, monthly: monthlySpread(100000, 0.5) },
    ],
  },
  {
    id: 'wbs-003',
    codice: 'IT-2025-003',
    nome: 'Sicurezza Informatica & SOC',
    responsabile: 'Alessandro Neri',
    area: 'Cybersecurity',
    centroCosto: 'CC-IT-003',
    legalEntity: 'A2A S.p.A.',
    fornitore: 'Leonardo S.p.A.',
    anno: 2025,
    stato: 'Attiva',
    budgetTotale: 320000,
    rollingTotale: 336000,
    impegnato: 95000,
    actual: 78000,
    costi: [
      { voce: 'Servizi SOC Gestito', tipo: 'Opex', budget: 180000, rolling: 189000, actual: 58000, monthly: monthlySpread(180000) },
      { voce: 'Tool SIEM', tipo: 'Opex', budget: 90000, rolling: 94500, actual: 15000, monthly: monthlySpread(90000, 0.1) },
      { voce: 'Firewall / HW Security', tipo: 'Capex', budget: 50000, rolling: 52500, actual: 5000, monthly: monthlySpread(50000, 0.7) },
    ],
  },
  {
    id: 'wbs-004',
    codice: 'IT-2025-004',
    nome: 'Digital Workplace & Collaboration',
    responsabile: 'Francesca Romano',
    area: 'Digital Workplace',
    centroCosto: 'CC-IT-004',
    legalEntity: 'A2A Energia S.r.l.',
    fornitore: 'Microsoft Italia',
    anno: 2025,
    stato: 'Attiva',
    budgetTotale: 210000,
    rollingTotale: 220500,
    impegnato: 82000,
    actual: 67500,
    costi: [
      { voce: 'Microsoft 365', tipo: 'Opex', budget: 120000, rolling: 126000, actual: 50000, monthly: monthlySpread(120000, 0.05) },
      { voce: 'Device Management', tipo: 'Capex', budget: 60000, rolling: 63000, actual: 12000, monthly: monthlySpread(60000, 0.3) },
      { voce: 'Collaborazione & Video', tipo: 'Opex', budget: 30000, rolling: 31500, actual: 5500, monthly: monthlySpread(30000, 0.2) },
    ],
  },
  {
    id: 'wbs-005',
    codice: 'IT-2025-005',
    nome: 'Data Platform & Analytics',
    responsabile: 'Stefano Conti',
    area: 'Data & Analytics',
    centroCosto: 'CC-IT-005',
    legalEntity: 'A2A Smart City S.r.l.',
    fornitore: 'Capgemini Italia',
    anno: 2025,
    stato: 'Attiva',
    budgetTotale: 560000,
    rollingTotale: 588000,
    impegnato: 198000,
    actual: 154000,
    costi: [
      { voce: 'Data Engineering', tipo: 'Capex', budget: 280000, rolling: 294000, actual: 98000, monthly: monthlySpread(280000, 0.15) },
      { voce: 'BI & Reporting', tipo: 'Opex', budget: 160000, rolling: 168000, actual: 42000, monthly: monthlySpread(160000, 0.2) },
      { voce: 'AI/ML Platform', tipo: 'Capex', budget: 120000, rolling: 126000, actual: 14000, monthly: monthlySpread(120000, 0.6) },
    ],
  },
  {
    id: 'wbs-006',
    codice: 'IT-2025-006',
    nome: 'Network & Connettività',
    responsabile: 'Roberto Esposito',
    area: 'IT Infrastructure',
    centroCosto: 'CC-IT-001',
    legalEntity: 'A2A S.p.A.',
    fornitore: 'TIM Enterprise',
    anno: 2025,
    stato: 'Sospesa',
    budgetTotale: 180000,
    rollingTotale: 189000,
    impegnato: 45000,
    actual: 38000,
    costi: [
      { voce: 'Circuiti WAN', tipo: 'Opex', budget: 120000, rolling: 126000, actual: 30000, monthly: monthlySpread(120000, 0.05) },
      { voce: 'SD-WAN Upgrade', tipo: 'Capex', budget: 60000, rolling: 63000, actual: 8000, monthly: monthlySpread(60000, 0.8) },
    ],
  },
];

export const purchaseRequests: PurchaseRequest[] = [
  {
    id: 'pr-001', numero: 'PR-2025-0001',
    wbsId: 'wbs-001', wbsCodice: 'IT-2025-001', wbsNome: 'Infrastruttura Cloud AWS',
    voceCosto: 'Servizi Cloud', fornitore: 'Amazon Web Services',
    importo: 85000, stato: 'Approvata',
    creatore: 'Marco Bianchi', dataCreazione: '2025-02-15', note: 'Rinnovo contratto AWS EC2 - Q1'
  },
  {
    id: 'pr-002', numero: 'PR-2025-0002',
    wbsId: 'wbs-002', wbsCodice: 'IT-2025-002', wbsNome: 'Progetto SAP S/4HANA Migration',
    voceCosto: 'Consulenza Esterna', fornitore: 'SAP Italia',
    importo: 150000, stato: 'Inviata a SAP',
    creatore: 'Laura Verdi', dataCreazione: '2025-03-01', note: 'Fase 1 implementazione FICO'
  },
  {
    id: 'pr-003', numero: 'PR-2025-0003',
    wbsId: 'wbs-003', wbsCodice: 'IT-2025-003', wbsNome: 'Sicurezza Informatica & SOC',
    voceCosto: 'Servizi SOC Gestito', fornitore: 'Leonardo S.p.A.',
    importo: 45000, stato: 'Approvata',
    creatore: 'Alessandro Neri', dataCreazione: '2025-01-20', note: 'Servizi SOC H1 2025'
  },
  {
    id: 'pr-004', numero: 'PR-2025-0004',
    wbsId: 'wbs-005', wbsCodice: 'IT-2025-005', wbsNome: 'Data Platform & Analytics',
    voceCosto: 'Data Engineering', fornitore: 'Capgemini Italia',
    importo: 98000, stato: 'Inviata',
    creatore: 'Stefano Conti', dataCreazione: '2025-04-10', note: 'Sprint 3-4 Data Lake'
  },
  {
    id: 'pr-005', numero: 'PR-2025-0005',
    wbsId: 'wbs-004', wbsCodice: 'IT-2025-004', wbsNome: 'Digital Workplace & Collaboration',
    voceCosto: 'Device Management', fornitore: 'TBD',
    importo: 12000, stato: 'Bozza',
    creatore: 'Francesca Romano', dataCreazione: '2025-05-05', note: 'Acquisto laptop Q2'
  },
  {
    id: 'pr-006', numero: 'PR-2025-0006',
    wbsId: 'wbs-002', wbsCodice: 'IT-2025-002', wbsNome: 'Progetto SAP S/4HANA Migration',
    voceCosto: 'Formazione', fornitore: 'SAP Italia',
    importo: 25000, stato: 'Rifiutata',
    creatore: 'Laura Verdi', dataCreazione: '2025-03-20', note: 'Training SAP HANA admin — rifiutata: fuori budget'
  },
];

// ---- Persistence (localStorage) ----
// The prototype has no backend: created WBS, created PRs, and PR status changes
// are persisted to localStorage and rehydrated into the module arrays on load.
// Bump the version when the seed data above changes shape.
const STORAGE_KEY = 'a2a-budget-tool-data-v1';

interface PersistedData {
  wbs: WBS[];
  prs: PurchaseRequest[];
}

function persist(): void {
  try {
    const data: PersistedData = { wbs: wbsData, prs: purchaseRequests };
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
    }
  } catch {
    // corrupted payload: start over from the seed data
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
    persist();
  }
}

export function resetDemoData(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}

// Derived AFTER hydration so persisted entries are included
export const areas = [...new Set(wbsData.map(w => w.area))];
export const years = [2024, 2025, 2026];
export const legalEntities = ['A2A S.p.A.', 'A2A Energia S.r.l.', 'A2A Smart City S.r.l.'];

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
