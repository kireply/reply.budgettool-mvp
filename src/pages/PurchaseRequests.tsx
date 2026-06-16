import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, CheckCircle, XCircle, ArrowRight, X } from 'lucide-react';
import {
  purchaseRequests, wbsData, vociCosto, fornitori, STATUS_FLOW,
  formatCurrency, getStatusColor, addPurchaseRequest, updatePRStatus,
  accertatoByVoce,
  type PurchaseRequest, type PRStatus
} from '../data/mockData';
import { colors, weight } from '../theme';
import { useI18n } from '../i18n';

export default function PurchaseRequests() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const preselectedWBS = searchParams.get('wbs');

  // Local mirror of the persistent store; refreshed after every mutation
  const [prs, setPrs] = useState<PurchaseRequest[]>(() => [...purchaseRequests]);
  const [showForm, setShowForm] = useState(!!preselectedWBS);
  const [search, setSearch] = useState('');
  const [filterStato, setFilterStato] = useState('');
  const [selectedPR, setSelectedPR] = useState<PurchaseRequest | null>(null);

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
    const oggi = new Date().toISOString().split('T')[0];
    const newPR: PurchaseRequest = {
      id: `pr-${Date.now()}`,
      numero: `PR-${new Date().getFullYear()}-${String(prs.length + 1).padStart(4, '0')}`,
      wbsId: form.wbsId,
      wbsCodice: wbs.codice,
      wbsNome: wbs.nome,
      voceCosto: form.voceCosto,
      fornitore: form.fornitore || 'TBD',
      importo: parseFloat(form.importo),
      stato: 'Bozza',
      creatore: 'Utente corrente',
      dataCreazione: oggi,
      note: form.note,
      storia: [{ stato: 'Bozza', data: oggi }],
    };
    addPurchaseRequest(newPR);
    setPrs([...purchaseRequests]);
    setForm({ wbsId: '', voceCosto: '', fornitore: '', importo: '', note: '' });
    setBudgetCheck(null);
    setShowForm(false);
  };

  // Keep the open detail modal in sync after a mutation
  const refreshSelected = (prId: string) => {
    setSelectedPR(prev => (prev && prev.id === prId)
      ? purchaseRequests.find(p => p.id === prId) ?? null
      : prev);
  };

  const advanceStatus = (prId: string) => {
    const pr = purchaseRequests.find(p => p.id === prId);
    if (!pr) return;
    const idx = STATUS_FLOW.indexOf(pr.stato);
    if (idx >= 0 && idx < STATUS_FLOW.length - 1) {
      updatePRStatus(prId, STATUS_FLOW[idx + 1]);
      setPrs([...purchaseRequests]);
      refreshSelected(prId);
    }
  };

  const rejectPR = (prId: string) => {
    updatePRStatus(prId, 'Rifiutata');
    setPrs([...purchaseRequests]);
    refreshSelected(prId);
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

      {/* Workflow Steps — clickable toggle filters */}
      <div className="card" style={{ marginBottom: 24, padding: '14px 24px' }}>
        <div style={{ fontSize: 12, color: colors.grey800, marginBottom: 8, fontWeight: weight.semibold }}>{t('pr.workflow')}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {STATUS_FLOW.map((s, i) => {
            const active = filterStato === s;
            const count = prs.filter(p => p.stato === s).length;
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  onClick={() => setFilterStato(active ? '' : s)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: weight.semibold,
                    border: `1px solid ${active ? colors.azure500 : colors.grey300}`,
                    background: active ? colors.azure500 : colors.azure50,
                    color: active ? 'white' : colors.blue500,
                    cursor: 'pointer',
                    transition: 'all 300ms cubic-bezier(0.25, 1, 0.5, 1)',
                  }}
                >
                  {t(`status.${s}`)}
                  {count > 0 && (
                    <span style={{
                      fontSize: 10, fontWeight: weight.bold,
                      background: active ? 'rgba(255,255,255,0.25)' : colors.grey300,
                      color: active ? 'white' : colors.grey800,
                      borderRadius: 10, padding: '1px 6px',
                      transition: 'all 300ms cubic-bezier(0.25, 1, 0.5, 1)',
                    }}>{count}</span>
                  )}
                </button>
                {i < STATUS_FLOW.length - 1 && <ArrowRight size={16} color={colors.grey300} style={{ margin: '0 4px' }} />}
              </div>
            );
          })}
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
                <tr key={pr.id} onClick={() => setSelectedPR(pr)}
                  style={{ borderBottom: `1px solid ${colors.grey100}`, cursor: 'pointer' }}>
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
                        <button onClick={e => { e.stopPropagation(); advanceStatus(pr.id); }}
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
                        <button onClick={e => { e.stopPropagation(); rejectPR(pr.id); }}
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

      {/* PR detail modal — small modal (560px) normally; wider (800px) for PO Creato with cost breakdown */}
      {selectedPR && (
        <div onClick={() => setSelectedPR(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
          <div className="card animate-in" onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: selectedPR.stato === 'PO Creato' ? 800 : 560, maxHeight: 'calc(100vh - 56px)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: colors.grey800, marginBottom: 2 }}>{t('pr.detailTitle')}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 style={{ fontSize: 18, fontWeight: weight.bold, color: colors.blue800 }}>{selectedPR.numero}</h3>
                  <span className={getStatusColor(selectedPR.stato)}>{t(`status.${selectedPR.stato}`)}</span>
                </div>
              </div>
              {/* 32px circular icon button (CDL touch target rule) */}
              <button onClick={() => setSelectedPR(null)} title={t('common.close')}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  border: `1px solid ${colors.grey300}`, background: 'white', color: colors.grey800,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 300ms cubic-bezier(0.25, 1, 0.5, 1)',
                }}>
                <X size={15} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: t('th.wbs'), value: `${selectedPR.wbsCodice} — ${selectedPR.wbsNome}` },
                { label: t('th.voce'), value: selectedPR.voceCosto },
                { label: t('th.fornitore'), value: selectedPR.fornitore },
                { label: t('th.importo'), value: formatCurrency(selectedPR.importo) },
                { label: t('pr.creatore'), value: selectedPR.creatore },
                { label: t('th.data'), value: selectedPR.dataCreazione },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 11, color: colors.grey800 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: weight.medium, color: colors.blue800 }}>{value}</div>
                </div>
              ))}
            </div>

            {selectedPR.note && (
              <div style={{ marginBottom: 16, padding: '10px 12px', background: colors.grey100, borderRadius: 12 }}>
                <div style={{ fontSize: 11, color: colors.grey800, marginBottom: 2 }}>{t('th.note')}</div>
                <div style={{ fontSize: 13, color: colors.blue800 }}>{selectedPR.note}</div>
              </div>
            )}

            {/* PO cost breakdown — shown only when PO Creato */}
            {selectedPR.stato === 'PO Creato' && (() => {
              const wbs = wbsData.find(w => w.id === selectedPR.wbsId);
              if (!wbs) return null;
              return (
                <div style={{ borderTop: `1px solid ${colors.grey100}`, paddingTop: 16, marginBottom: 16 }}>
                  <h4 style={{ fontSize: 14, fontWeight: weight.semibold, color: colors.blue800, marginBottom: 12 }}>
                    {t('po.costBreakdown')} — {wbs.codice}
                  </h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead>
                        <tr className="table-head">
                          <th style={{ padding: '8px 12px', textAlign: 'left' }}>{t('th.voce')}</th>
                          <th style={{ padding: '8px 12px', textAlign: 'right' }}>{t('po.budget')}</th>
                          <th style={{ padding: '8px 12px', textAlign: 'right' }}>{t('po.rolling')}</th>
                          <th style={{ padding: '8px 12px', textAlign: 'right' }}>{t('po.actualSAP')}</th>
                          <th style={{ padding: '8px 12px', textAlign: 'right' }}>{t('po.accertato')}</th>
                          <th style={{ padding: '8px 12px', textAlign: 'right' }}>{t('po.consuntivo')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {wbs.costi.map((c, i) => {
                          const acc = accertatoByVoce(wbs.id, c.voce);
                          const consuntivo = c.actual + acc;
                          return (
                            <tr key={c.voce} style={{ borderBottom: `1px solid ${colors.grey300}`, background: i % 2 === 0 ? 'white' : colors.grey100 }}>
                              <td style={{ padding: '8px 12px', fontWeight: weight.medium, color: colors.blue800 }}>{c.voce}</td>
                              <td style={{ padding: '8px 12px', textAlign: 'right' }}>{formatCurrency(c.budget)}</td>
                              <td style={{ padding: '8px 12px', textAlign: 'right', color: colors.azure500 }}>{formatCurrency(c.rolling)}</td>
                              <td style={{ padding: '8px 12px', textAlign: 'right', color: colors.green }}>{formatCurrency(c.actual)}</td>
                              <td style={{ padding: '8px 12px', textAlign: 'right', color: colors.orange }}>{formatCurrency(acc)}</td>
                              <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: weight.semibold, color: colors.blue800 }}>{formatCurrency(consuntivo)}</td>
                            </tr>
                          );
                        })}
                        <tr style={{ background: colors.grey100, fontWeight: weight.semibold }}>
                          <td style={{ padding: '8px 12px', color: colors.blue800 }}>Totale</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }}>{formatCurrency(wbs.costi.reduce((s, c) => s + c.budget, 0))}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', color: colors.azure500 }}>{formatCurrency(wbs.costi.reduce((s, c) => s + c.rolling, 0))}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', color: colors.green }}>{formatCurrency(wbs.costi.reduce((s, c) => s + c.actual, 0))}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', color: colors.orange }}>{formatCurrency(wbs.costi.reduce((s, c) => s + accertatoByVoce(wbs.id, c.voce), 0))}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', color: colors.blue800 }}>{formatCurrency(wbs.costi.reduce((s, c) => s + c.actual + accertatoByVoce(wbs.id, c.voce), 0))}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            {/* Status timeline */}
            <div style={{ borderTop: `1px solid ${colors.grey100}`, paddingTop: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: weight.semibold, color: colors.blue800, marginBottom: 12 }}>
                {t('pr.timeline')}
              </h4>
              {(() => {
                const storia = selectedPR.storia ?? [];
                const isRejected = storia.some(e => e.stato === 'Rifiutata');
                const storiaMap = new Map(storia.map(e => [e.stato, e.data]));
                const reachedStates = new Set(storia.map(e => e.stato));

                type TimelineItem = { stato: string; data?: string; future: boolean };
                const items: TimelineItem[] = [];
                if (isRejected) {
                  storia.forEach(e => items.push({ stato: e.stato, data: e.data, future: false }));
                } else {
                  STATUS_FLOW.forEach(stato => {
                    if (reachedStates.has(stato)) {
                      items.push({ stato, data: storiaMap.get(stato), future: false });
                    } else {
                      items.push({ stato, future: true });
                    }
                  });
                }

                const lastReachedIdx = items.reduce((acc, item, i) => (!item.future ? i : acc), -1);

                return items.map((item, i) => {
                  const isLast = i === items.length - 1;
                  const isCurrent = i === lastReachedIdx;
                  const dotColor = item.future ? colors.grey300
                    : item.stato === 'Rifiutata' ? colors.red
                    : isCurrent ? colors.azure500
                    : colors.green;
                  return (
                    <div key={i} style={{ display: 'flex', gap: 12 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: 10, height: 10, borderRadius: '50%', marginTop: 4,
                          background: dotColor, flexShrink: 0,
                        }} />
                        {!isLast && <div style={{ width: 2, flex: 1, background: colors.grey300, margin: '2px 0' }} />}
                      </div>
                      <div style={{ paddingBottom: isLast ? 0 : 14 }}>
                        <div style={{
                          fontSize: 13,
                          fontWeight: isCurrent ? weight.semibold : weight.medium,
                          color: colors.blue800,
                          opacity: item.future ? 0.4 : 1,
                        }}>
                          {t(`status.${item.stato}`)}
                        </div>
                        {item.data && <div style={{ fontSize: 11, color: colors.grey800 }}>{item.data}</div>}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn-secondary" onClick={() => setSelectedPR(null)}>
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
