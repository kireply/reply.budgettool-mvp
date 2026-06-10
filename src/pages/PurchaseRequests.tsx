import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import {
  purchaseRequests, wbsData, vociCosto, fornitori,
  formatCurrency, getStatusColor, addPurchaseRequest, updatePRStatus,
  type PurchaseRequest, type PRStatus
} from '../data/mockData';
import { colors, weight } from '../theme';
import { useI18n } from '../i18n';

const STATUS_FLOW: PRStatus[] = ['Bozza', 'Inviata', 'Approvata', 'Inviata a SAP', 'PO Creato'];

export default function PurchaseRequests() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const preselectedWBS = searchParams.get('wbs');

  // Local mirror of the persistent store; refreshed after every mutation
  const [prs, setPrs] = useState<PurchaseRequest[]>(() => [...purchaseRequests]);
  const [showForm, setShowForm] = useState(!!preselectedWBS);
  const [search, setSearch] = useState('');
  const [filterStato, setFilterStato] = useState('');

  const [form, setForm] = useState({
    wbsId: preselectedWBS || '',
    voceCosto: '',
    fornitore: '',
    importo: '',
    note: '',
  });
  const [budgetCheck, setBudgetCheck] = useState<{ ok: boolean; disponibile: number; importo: number } | null>(null);

  useEffect(() => {
    if (form.wbsId && form.importo) {
      const wbs = wbsData.find(w => w.id === form.wbsId);
      if (wbs) {
        const esistentiPR = prs.filter(p => p.wbsId === form.wbsId && p.stato !== 'Rifiutata').reduce((s, p) => s + p.importo, 0);
        const disponibile = wbs.rollingTotale - esistentiPR;
        const imp = parseFloat(form.importo) || 0;
        setBudgetCheck({ ok: imp <= disponibile, disponibile, importo: imp });
      }
    } else {
      setBudgetCheck(null);
    }
  }, [form.wbsId, form.importo, prs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetCheck?.ok) return;
    const wbs = wbsData.find(w => w.id === form.wbsId)!;
    const newPR: PurchaseRequest = {
      id: `pr-${Date.now()}`,
      numero: `PR-2025-${String(prs.length + 1).padStart(4, '0')}`,
      wbsId: form.wbsId,
      wbsCodice: wbs.codice,
      wbsNome: wbs.nome,
      voceCosto: form.voceCosto,
      fornitore: form.fornitore || 'TBD',
      importo: parseFloat(form.importo),
      stato: 'Bozza',
      creatore: 'Utente corrente',
      dataCreazione: new Date().toISOString().split('T')[0],
      note: form.note,
    };
    addPurchaseRequest(newPR);
    setPrs([...purchaseRequests]);
    setForm({ wbsId: '', voceCosto: '', fornitore: '', importo: '', note: '' });
    setBudgetCheck(null);
    setShowForm(false);
  };

  const advanceStatus = (prId: string) => {
    const pr = purchaseRequests.find(p => p.id === prId);
    if (!pr) return;
    const idx = STATUS_FLOW.indexOf(pr.stato);
    if (idx >= 0 && idx < STATUS_FLOW.length - 1) {
      updatePRStatus(prId, STATUS_FLOW[idx + 1]);
      setPrs([...purchaseRequests]);
    }
  };

  const rejectPR = (prId: string) => {
    updatePRStatus(prId, 'Rifiutata');
    setPrs([...purchaseRequests]);
  };

  const filtered = prs.filter(p => {
    const matchSearch = !search ||
      p.numero.toLowerCase().includes(search.toLowerCase()) ||
      p.wbsNome.toLowerCase().includes(search.toLowerCase()) ||
      p.fornitore.toLowerCase().includes(search.toLowerCase());
    const matchStato = !filterStato || p.stato === filterStato;
    return matchSearch && matchStato;
  });

  const totApproved = prs.filter(p => ['Approvata', 'Inviata a SAP', 'PO Creato'].includes(p.stato)).reduce((s, p) => s + p.importo, 0);
  const totPending = prs.filter(p => ['Bozza', 'Inviata'].includes(p.stato)).reduce((s, p) => s + p.importo, 0);

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: weight.bold, color: colors.blue800, marginBottom: 4 }}>{t('pr.title')}</h1>
          <p style={{ fontSize: 14, color: colors.grey800 }}>{t('pr.subtitle')}</p>
        </div>
        {/* Primary CTA: all caps + arrow-in-circle */}
        <button onClick={() => setShowForm(!showForm)} className="cta-primary">
          {t('pr.new')}
          <span className="cta-circle"><Plus size={15} /></span>
        </button>
      </div>

      {/* Summary — Big Data Items */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {[
          { label: t('pr.total'), value: prs.length, color: colors.azure500 },
          { label: t('pr.approvedGroup'), value: `${prs.filter(p => ['Approvata','Inviata a SAP','PO Creato'].includes(p.stato)).length} · ${formatCurrency(totApproved)}`, color: colors.green },
          { label: t('pr.pending'), value: `${prs.filter(p => ['Bozza','Inviata'].includes(p.stato)).length} · ${formatCurrency(totPending)}`, color: colors.orange },
          { label: t('pr.rejected'), value: prs.filter(p => p.stato === 'Rifiutata').length, color: colors.red },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: colors.grey800, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 17, fontWeight: weight.bold, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Workflow Steps */}
      <div className="card" style={{ marginBottom: 24, padding: '14px 24px' }}>
        <div style={{ fontSize: 12, color: colors.grey800, marginBottom: 8, fontWeight: weight.semibold }}>{t('pr.workflow')}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {STATUS_FLOW.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: weight.semibold,
                background: colors.azure50, color: colors.blue500, border: `1px solid ${colors.grey300}`,
              }}>{t(`status.${s}`)}</div>
              {i < STATUS_FLOW.length - 1 && <ArrowRight size={16} color={colors.grey300} style={{ margin: '0 4px' }} />}
            </div>
          ))}
        </div>
      </div>

      {/* New PR Form */}
      {showForm && (
        <div className="card animate-in" style={{ marginBottom: 24, borderLeft: `3px solid ${colors.azure500}` }}>
          <h3 style={{ fontSize: 16, fontWeight: weight.semibold, color: colors.blue800, marginBottom: 16 }}>{t('pr.formTitle')}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: colors.blue800, fontWeight: weight.semibold, display: 'block', marginBottom: 4 }}>{t('pr.wbsRef')}</label>
                <select required value={form.wbsId} onChange={e => setForm(f => ({ ...f, wbsId: e.target.value }))} className="select">
                  <option value="">{t('pr.selectWBS')}</option>
                  {wbsData.filter(w => w.stato === 'Attiva').map(w => (
                    <option key={w.id} value={w.id}>{w.codice} — {w.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: colors.blue800, fontWeight: weight.semibold, display: 'block', marginBottom: 4 }}>{t('pr.voce')}</label>
                <select required value={form.voceCosto} onChange={e => setForm(f => ({ ...f, voceCosto: e.target.value }))} className="select">
                  <option value="">{t('pr.selectVoce')}</option>
                  {vociCosto.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: colors.blue800, fontWeight: weight.semibold, display: 'block', marginBottom: 4 }}>{t('pr.fornitore')}</label>
                <select value={form.fornitore} onChange={e => setForm(f => ({ ...f, fornitore: e.target.value }))} className="select">
                  <option value="">{t('pr.tbd')}</option>
                  {fornitori.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: colors.blue800, fontWeight: weight.semibold, display: 'block', marginBottom: 4 }}>{t('pr.importo')}</label>
                <input required type="number" min="1" placeholder={t('pr.importoPh')}
                  value={form.importo} onChange={e => setForm(f => ({ ...f, importo: e.target.value }))}
                  className="input" />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: colors.blue800, fontWeight: weight.semibold, display: 'block', marginBottom: 4 }}>{t('pr.note')}</label>
              <textarea rows={2} placeholder={t('pr.notePh')}
                value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                className="input" style={{ resize: 'vertical' }} />
            </div>

            {/* Budget Check — Notice component (CDL §26) */}
            {budgetCheck && (
              <div className="animate-in" style={{
                padding: '12px 16px', borderRadius: 12, marginBottom: 16,
                background: budgetCheck.ok ? colors.greenLight : colors.redLight,
                border: `1px solid ${budgetCheck.ok ? colors.green : colors.red}`,
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 13, color: budgetCheck.ok ? colors.green : colors.red,
                fontWeight: weight.medium,
              }}>
                {budgetCheck.ok
                  ? <CheckCircle size={16} color={colors.green} />
                  : <XCircle size={16} color={colors.red} />}
                {budgetCheck.ok
                  ? t('pr.checkOk', { residuo: formatCurrency(budgetCheck.disponibile - budgetCheck.importo) })
                  : t('pr.checkKo', { disp: formatCurrency(budgetCheck.disponibile), req: formatCurrency(budgetCheck.importo) })}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              {/* Primary CTA submit */}
              <button type="submit" disabled={!budgetCheck?.ok} className="cta-primary">
                {t('pr.saveDraft')}
                <span className="cta-circle"><ArrowRight size={15} /></span>
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters + List */}
      <div className="card" style={{ marginBottom: 16, padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <Search size={16} color={colors.azure500} />
            <input type="text" placeholder={t('pr.searchPlaceholder')}
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: 13, width: '100%', color: colors.blue800, background: 'transparent' }} />
          </div>
          <select value={filterStato} onChange={e => setFilterStato(e.target.value)} className="select" style={{ width: 'auto', fontSize: 12 }}>
            <option value="">{t('filter.allStates')}</option>
            {(['Bozza', 'Inviata', 'Approvata', 'Rifiutata', 'Inviata a SAP', 'PO Creato'] as PRStatus[]).map(s => (
              <option key={s} value={s}>{t(`status.${s}`)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr className="table-head">
              {[t('th.numeroPR'), t('th.wbs'), t('th.voce'), t('th.fornitore'), t('th.importo'), t('th.stato'), t('th.data'), t('th.azioni')].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(pr => {
              const canAdvance = pr.stato !== 'PO Creato' && pr.stato !== 'Rifiutata';
              const canReject = pr.stato === 'Bozza' || pr.stato === 'Inviata';
              return (
                <tr key={pr.id} style={{ borderBottom: `1px solid ${colors.grey100}` }}>
                  <td style={{ padding: '10px 12px', fontWeight: weight.bold, color: colors.azure600 }}>{pr.numero}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: weight.medium, color: colors.blue800, fontSize: 12 }}>{pr.wbsCodice}</div>
                    <div style={{ fontSize: 11, color: colors.grey800, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pr.wbsNome}</div>
                  </td>
                  <td style={{ padding: '10px 12px', color: colors.grey800 }}>{pr.voceCosto}</td>
                  <td style={{ padding: '10px 12px', color: colors.grey800 }}>{pr.fornitore}</td>
                  <td style={{ padding: '10px 12px', fontWeight: weight.bold, color: colors.blue800 }}>{formatCurrency(pr.importo)}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className={getStatusColor(pr.stato)}>{t(`status.${pr.stato}`)}</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: colors.grey800, fontSize: 12 }}>{pr.dataCreazione}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {/* 32px circular icon buttons (CDL §9 + touch target rule) */}
                      {canAdvance && (
                        <button onClick={() => advanceStatus(pr.id)}
                          title={t('pr.advance')}
                          style={{
                            width: 32, height: 32, borderRadius: '50%',
                            border: `1px solid ${colors.green}`, background: colors.greenLight, color: colors.green,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 300ms cubic-bezier(0.25, 1, 0.5, 1)',
                          }}>
                          <CheckCircle size={14} />
                        </button>
                      )}
                      {canReject && (
                        <button onClick={() => rejectPR(pr.id)}
                          title={t('pr.reject')}
                          style={{
                            width: 32, height: 32, borderRadius: '50%',
                            border: `1px solid ${colors.red}`, background: colors.redLight, color: colors.red,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 300ms cubic-bezier(0.25, 1, 0.5, 1)',
                          }}>
                          <XCircle size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: colors.grey800, fontSize: 14 }}>
            {t('pr.empty')}
          </div>
        )}
      </div>
    </div>
  );
}
