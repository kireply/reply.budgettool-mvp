import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { ArrowLeft, Plus, TrendingUp, Building2, User, Calendar } from 'lucide-react';
import {
  wbsData, purchaseRequests, accertamenti, entrateMerciPianificate,
  formatCurrency, getStatusColor, getWBSStatusColor, impegnatoOf,
  accertatoOf, addAccertamento, addEMP, updateEMPStato,
  type Accertamento, type EntrataMerciPianificata, type EMStato,
  MONTHS, getEMPStatusColor,
} from '../data/mockData';
import { colors, weight, chartColors } from '../theme';
import { useI18n } from '../i18n';

type ScenarioKey = 'budget' | 'rolling' | 'actual';
type TabKey = 'costi' | 'distribuzione' | 'pr' | 'consuntivo';

const EMP_FLOW: EMStato[] = ['Pianificata', 'Confermata', 'Ricevuta SAP'];

export default function WBSDetail() {
  const { t, months } = useI18n();
  const { id } = useParams<{ id: string }>();

  const [activeTab, setActiveTab] = useState<TabKey>('costi');
  const [selectedScenarios, setSelectedScenarios] = useState<ScenarioKey[]>(['budget', 'rolling']);

  // Consuntivo tab state — must be declared before the early return (hook rules)
  const [localAcc, setLocalAcc] = useState<Accertamento[]>(() => accertamenti.filter(a => a.wbsId === (id ?? '')));
  const [localEMP, setLocalEMP] = useState<EntrataMerciPianificata[]>(() => entrateMerciPianificate.filter(e => e.wbsId === (id ?? '')));
  const [showAccForm, setShowAccForm] = useState(false);
  const [showEmpForm, setShowEmpForm] = useState(false);
  const [accForm, setAccForm] = useState({ voceCosto: '', mese: 'Gen', importo: '', note: '' });
  const [empForm, setEmpForm] = useState({ voceCosto: '', fornitore: '', dataPrevista: '', importo: '', note: '' });

  const wbs = wbsData.find(w => w.id === id);
  if (!wbs) return (
    <div style={{ padding: 40, textAlign: 'center', color: colors.grey800 }}>
      {t('wd.notFound')} <Link to="/wbs" style={{ color: colors.azure600 }}>{t('wd.backToList')}</Link>
    </div>
  );

  const prs = purchaseRequests.filter(p => p.wbsId === wbs.id);
  const impegnato = impegnatoOf(wbs.id);
  const disponibile = wbs.rollingTotale - impegnato;
  const pctUsato = Math.round(impegnato / wbs.rollingTotale * 100);

  const monthlyData = wbs.costi.length > 0
    ? wbs.costi[0].monthly.map((_, i) => ({
        month: months[i],
        budget: wbs.costi.reduce((s, c) => s + c.monthly[i].budget, 0),
        rolling: wbs.costi.reduce((s, c) => s + c.monthly[i].rolling, 0),
        actual: wbs.costi.reduce((s, c) => s + c.monthly[i].actual, 0),
      }))
    : [];

  const toggleScenario = (s: ScenarioKey) => {
    setSelectedScenarios(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const scenarioColors: Record<ScenarioKey, string> = {
    budget: chartColors.budget,
    rolling: chartColors.rolling,
    actual: chartColors.impegnato,
  };

  // Consuntivo tab handlers
  const handleSaveAcc = () => {
    if (!accForm.voceCosto || !accForm.importo) return;
    const importoNum = parseFloat(accForm.importo);
    if (isNaN(importoNum) || importoNum <= 0) return;
    const a: Accertamento = {
      id: `acc-${Date.now()}`,
      wbsId: wbs.id,
      voceCosto: accForm.voceCosto,
      mese: accForm.mese,
      anno: wbs.anno,
      importo: importoNum,
      note: accForm.note,
      creatore: wbs.responsabile,
      dataCreazione: new Date().toISOString().split('T')[0],
    };
    addAccertamento(a);
    setLocalAcc([...accertamenti.filter(x => x.wbsId === wbs.id)]);
    setAccForm({ voceCosto: '', mese: 'Gen', importo: '', note: '' });
    setShowAccForm(false);
  };

  const handleSaveEmp = () => {
    if (!empForm.voceCosto || !empForm.dataPrevista || !empForm.importo) return;
    const importoNum = parseFloat(empForm.importo);
    if (isNaN(importoNum) || importoNum <= 0) return;
    const e: EntrataMerciPianificata = {
      id: `emp-${Date.now()}`,
      wbsId: wbs.id,
      voceCosto: empForm.voceCosto,
      fornitore: empForm.fornitore || wbs.fornitore,
      dataPrevista: empForm.dataPrevista,
      importo: importoNum,
      stato: 'Pianificata',
      note: empForm.note,
      creatore: wbs.responsabile,
      dataCreazione: new Date().toISOString().split('T')[0],
    };
    addEMP(e);
    setLocalEMP([...entrateMerciPianificate.filter(x => x.wbsId === wbs.id)]);
    setEmpForm({ voceCosto: '', fornitore: '', dataPrevista: '', importo: '', note: '' });
    setShowEmpForm(false);
  };

  const handleAdvanceEMP = (empId: string, currentStato: EMStato) => {
    const idx = EMP_FLOW.indexOf(currentStato);
    if (idx < EMP_FLOW.length - 1) {
      updateEMPStato(empId, EMP_FLOW[idx + 1]);
      setLocalEMP([...entrateMerciPianificate.filter(x => x.wbsId === wbs.id)]);
    }
  };

  return (
    <div className="animate-in">
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 13, color: colors.grey800 }}>
        <Link to="/wbs" className="ghost-link" style={{ fontWeight: weight.medium }}>
          <ArrowLeft size={15} /> {t('wbs.title')}
        </Link>
        <span>/</span>
        <span>{wbs.codice}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h1 style={{ fontSize: 22, fontWeight: weight.bold, color: colors.blue800 }}>{wbs.codice}</h1>
            <span className={getWBSStatusColor(wbs.stato)}>{t(`wstatus.${wbs.stato}`)}</span>
          </div>
          <p style={{ fontSize: 15, color: colors.blue800, marginBottom: 4 }}>{wbs.nome}</p>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: colors.grey800 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><User size={13} />{wbs.responsabile}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Building2 size={13} />{wbs.area}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={13} />{wbs.anno}</span>
          </div>
        </div>
        <Link to={`/purchase-requests/new?wbs=${wbs.id}`} className="cta-primary">
          {t('wd.createPR')}
          <span className="cta-circle"><Plus size={15} /></span>
        </Link>
      </div>

      {/* Info + KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: weight.semibold, color: colors.blue800, marginBottom: 12 }}>{t('wd.registry')}</h3>
          {[
            { label: t('wd.codice'), value: wbs.codice },
            { label: t('wd.centroCosto'), value: wbs.centroCosto },
            { label: t('wd.legalEntity'), value: wbs.legalEntity },
            { label: t('wd.fornitore'), value: wbs.fornitore },
            { label: t('wd.anno'), value: wbs.anno.toString() },
          ].map(({ label, value }) => (
            <div key={label} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: colors.grey800 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: weight.medium, color: colors.blue800 }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { label: t('kpi.initialBudget'), value: formatCurrency(wbs.budgetTotale), color: chartColors.budget },
              { label: t('wd.activeRolling'), value: formatCurrency(wbs.rollingTotale), color: colors.azure500 },
              { label: t('wd.committedKpi'), value: formatCurrency(impegnato), color: colors.orange },
              { label: t('wd.actualSap'), value: formatCurrency(wbs.actual), color: colors.green },
            ].map(({ label, value, color }) => (
              <div key={label} className="card" style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: colors.grey800, marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: weight.bold, color }}>{value}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: weight.semibold, color: colors.blue800 }}>{t('wd.usage')}</span>
              <span style={{ fontSize: 13, fontWeight: weight.bold, color: pctUsato > 80 ? colors.red : colors.green }}>{pctUsato}%</span>
            </div>
            <div style={{ height: 10, background: colors.grey100, borderRadius: 5 }}>
              <div style={{ width: `${Math.min(pctUsato, 100)}%`, height: '100%', background: pctUsato > 80 ? colors.red : colors.green, borderRadius: 5, transition: 'width 300ms cubic-bezier(0.25, 1, 0.5, 1)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: colors.grey800 }}>
              <span>{t('wd.committedLabel', { value: formatCurrency(impegnato) })}</span>
              <span style={{ color: disponibile < 0 ? colors.red : colors.green, fontWeight: weight.semibold }}>
                {t('wd.availableLabel', { value: formatCurrency(disponibile) })}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 12, color: colors.azure600 }}>
              <TrendingUp size={13} />
              {t('wd.rollingVsBudget', { pct: Math.round((wbs.rollingTotale / wbs.budgetTotale - 1) * 100) })}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `2px solid ${colors.grey300}`, marginBottom: 20 }}>
        {[
          { key: 'costi', label: t('tab.costs') },
          { key: 'distribuzione', label: t('tab.distribution') },
          { key: 'pr', label: t('tab.pr', { n: prs.length }) },
          { key: 'consuntivo', label: t('tab.consuntivo') },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as TabKey)}
            className={`tab ${activeTab === key ? 'active' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Voci di Costo */}
      {activeTab === 'costi' && (
        <div className="card animate-in" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr className="table-head">
                {[t('th.voce'), t('th.tipo'), t('th.budget'), t('th.rolling'), t('th.actual'), t('th.deltaRB'), t('th.pctAR')].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {wbs.costi.map((c, i) => {
                const delta = c.rolling - c.budget;
                const pct = Math.round(c.actual / c.rolling * 100);
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${colors.grey100}` }}>
                    <td style={{ padding: '10px 12px', fontWeight: weight.medium, color: colors.blue800 }}>{c.voce}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ background: c.tipo === 'Capex' ? colors.azure50 : colors.greenLight, color: c.tipo === 'Capex' ? colors.blue500 : colors.green, borderRadius: 12, padding: '2px 8px', fontSize: 11, fontWeight: weight.semibold }}>
                        {c.tipo}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: colors.blue800 }}>{formatCurrency(c.budget)}</td>
                    <td style={{ padding: '10px 12px', fontWeight: weight.semibold, color: colors.azure600 }}>{formatCurrency(c.rolling)}</td>
                    <td style={{ padding: '10px 12px', color: colors.orange }}>{formatCurrency(c.actual)}</td>
                    <td style={{ padding: '10px 12px', color: delta > 0 ? colors.red : colors.green, fontWeight: weight.medium }}>
                      {delta > 0 ? '+' : ''}{formatCurrency(delta)}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 48, height: 5, background: colors.grey100, borderRadius: 3 }}>
                          <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: colors.orange, borderRadius: 3, transition: 'width 300ms cubic-bezier(0.25, 1, 0.5, 1)' }} />
                        </div>
                        <span style={{ fontSize: 11, color: colors.grey800 }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr style={{ borderTop: `2px solid ${colors.grey300}`, background: colors.grey100, fontWeight: weight.bold }}>
                <td style={{ padding: '10px 12px', color: colors.blue800 }} colSpan={2}>{t('wd.total')}</td>
                <td style={{ padding: '10px 12px', color: colors.blue800 }}>{formatCurrency(wbs.budgetTotale)}</td>
                <td style={{ padding: '10px 12px', color: colors.azure600 }}>{formatCurrency(wbs.rollingTotale)}</td>
                <td style={{ padding: '10px 12px', color: colors.orange }}>{formatCurrency(wbs.actual)}</td>
                <td style={{ padding: '10px 12px', color: colors.red }}>+{formatCurrency(wbs.rollingTotale - wbs.budgetTotale)}</td>
                <td style={{ padding: '10px 12px', color: colors.blue800 }}>{Math.round(wbs.actual / wbs.rollingTotale * 100)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Distribuzione Mensile */}
      {activeTab === 'distribuzione' && (
        <div className="card animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: weight.semibold, color: colors.blue800 }}>{t('wd.distTitle')}</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['budget', 'rolling', 'actual'] as ScenarioKey[]).map(s => (
                <button key={s} onClick={() => toggleScenario(s)}
                  style={{
                    padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: weight.semibold,
                    border: `2px solid ${scenarioColors[s]}`,
                    background: selectedScenarios.includes(s) ? scenarioColors[s] : 'white',
                    color: selectedScenarios.includes(s) ? 'white' : scenarioColors[s],
                    cursor: 'pointer',
                    transition: 'background 300ms cubic-bezier(0.25, 1, 0.5, 1), color 300ms cubic-bezier(0.25, 1, 0.5, 1)',
                  }}>
                  {t(`scenario.${s}`)}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: colors.grey800 }} />
              <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: colors.grey800 }} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend />
              {selectedScenarios.includes('budget') && (
                <Bar isAnimationActive={false} dataKey="budget" name={t('scenario.budget')} fill={scenarioColors.budget} radius={[4,4,0,0]} opacity={0.85} />
              )}
              {selectedScenarios.includes('rolling') && (
                <Bar isAnimationActive={false} dataKey="rolling" name={t('scenario.rolling')} fill={scenarioColors.rolling} radius={[4,4,0,0]} />
              )}
              {selectedScenarios.includes('actual') && (
                <Bar isAnimationActive={false} dataKey="actual" name={t('scenario.actual')} fill={scenarioColors.actual} radius={[4,4,0,0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: weight.semibold, color: colors.blue800, marginBottom: 12 }}>{t('wd.distTable')}</h4>
            <div className="table-scroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr className="table-head">
                    <th>{t('th.mese')}</th>
                    {selectedScenarios.map(s => (
                      <th key={s} style={{ textAlign: 'right', color: scenarioColors[s] }}>{t(`scenario.${s}`)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((m, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${colors.grey100}` }}>
                      <td style={{ padding: '7px 12px', fontWeight: weight.medium, color: colors.blue800 }}>{m.month}</td>
                      {selectedScenarios.map(s => (
                        <td key={s} style={{ padding: '7px 12px', textAlign: 'right', color: scenarioColors[s] }}>
                          {formatCurrency(m[s as keyof typeof m] as number)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Purchase Request */}
      {activeTab === 'pr' && (
        <div className="card animate-in" style={{ padding: prs.length === 0 ? 24 : 0, overflow: 'hidden' }}>
          {prs.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: colors.grey800 }}>
              {t('wd.noPR')}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr className="table-head">
                  {[t('th.numeroPR'), t('th.voce'), t('th.fornitore'), t('th.importo'), t('th.stato'), t('th.data'), t('th.note')].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prs.map(pr => (
                  <tr key={pr.id} style={{ borderBottom: `1px solid ${colors.grey100}` }}>
                    <td style={{ padding: '10px 12px', fontWeight: weight.bold, color: colors.azure600 }}>{pr.numero}</td>
                    <td style={{ padding: '10px 12px', color: colors.blue800 }}>{pr.voceCosto}</td>
                    <td style={{ padding: '10px 12px', color: colors.grey800 }}>{pr.fornitore}</td>
                    <td style={{ padding: '10px 12px', fontWeight: weight.semibold, color: colors.blue800 }}>{formatCurrency(pr.importo)}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className={getStatusColor(pr.stato)}>{t(`status.${pr.stato}`)}</span>
                    </td>
                    <td style={{ padding: '10px 12px', color: colors.grey800, fontSize: 12 }}>{pr.dataCreazione}</td>
                    <td style={{ padding: '10px 12px', color: colors.grey800, fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pr.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab: Consuntivo */}
      {activeTab === 'consuntivo' && (
        <div className="animate-in">
          {/* KPI Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: t('cons.sapActual'), value: formatCurrency(wbs.actual), color: colors.green },
              { label: t('cons.accertato'), value: formatCurrency(accertatoOf(wbs.id)), color: colors.azure600 },
              { label: t('cons.totale'), value: formatCurrency(wbs.actual + accertatoOf(wbs.id)), color: colors.blue800 },
            ].map(({ label, value, color }) => (
              <div key={label} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: colors.grey800, marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 20, fontWeight: weight.bold, color }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Sezione Accertamenti */}
          <div className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: `1px solid ${colors.grey100}` }}>
              <h3 style={{ fontSize: 15, fontWeight: weight.semibold, color: colors.blue800 }}>{t('cons.accTitle')}</h3>
              <button
                className="btn-secondary"
                onClick={() => { setShowAccForm(p => !p); setShowEmpForm(false); }}
                style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Plus size={13} /> {t('cons.addAcc')}
              </button>
            </div>

            {showAccForm && (
              <div style={{ padding: 16, background: colors.grey100, borderBottom: `1px solid ${colors.grey300}` }}>
                <p style={{ fontSize: 13, fontWeight: weight.semibold, color: colors.blue800, marginBottom: 12 }}>{t('cons.accFormTitle')}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: colors.grey800, marginBottom: 4 }}>{t('cons.mese')}</label>
                    <select className="select" value={accForm.mese} onChange={e => setAccForm(p => ({ ...p, mese: e.target.value }))}>
                      {MONTHS.map((m, i) => <option key={m} value={m}>{months[i]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: colors.grey800, marginBottom: 4 }}>{t('th.voce')}</label>
                    <select className="select" value={accForm.voceCosto} onChange={e => setAccForm(p => ({ ...p, voceCosto: e.target.value }))}>
                      <option value="">—</option>
                      {wbs.costi.map(c => <option key={c.voce} value={c.voce}>{c.voce}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: colors.grey800, marginBottom: 4 }}>{t('th.importo')}</label>
                    <input type="number" className="input" value={accForm.importo} onChange={e => setAccForm(p => ({ ...p, importo: e.target.value }))} placeholder="Es: 15000" min="1" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: colors.grey800, marginBottom: 4 }}>{t('th.note')}</label>
                    <input type="text" className="input" value={accForm.note} onChange={e => setAccForm(p => ({ ...p, note: e.target.value }))} placeholder={t('pr.notePh')} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-secondary" onClick={handleSaveAcc} style={{ fontSize: 12 }}>{t('cons.save')}</button>
                  <button onClick={() => setShowAccForm(false)} style={{ fontSize: 12, background: 'none', border: 'none', color: colors.grey800, cursor: 'pointer' }}>{t('common.cancel')}</button>
                </div>
              </div>
            )}

            {localAcc.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: colors.grey800, fontSize: 13 }}>{t('cons.noAcc')}</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr className="table-head">
                    {[t('th.mese'), t('th.voce'), t('th.importo'), t('th.note'), t('th.responsabile'), t('th.data')].map(h => <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {localAcc.map(a => (
                    <tr key={a.id} style={{ borderBottom: `1px solid ${colors.grey100}` }}>
                      <td style={{ padding: '9px 12px', fontWeight: weight.semibold, color: colors.azure600 }}>{a.mese} {a.anno}</td>
                      <td style={{ padding: '9px 12px', color: colors.blue800 }}>{a.voceCosto}</td>
                      <td style={{ padding: '9px 12px', fontWeight: weight.semibold, color: colors.azure600 }}>{formatCurrency(a.importo)}</td>
                      <td style={{ padding: '9px 12px', color: colors.grey800, fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.note || '—'}</td>
                      <td style={{ padding: '9px 12px', color: colors.grey800, fontSize: 12 }}>{a.creatore}</td>
                      <td style={{ padding: '9px 12px', color: colors.grey800, fontSize: 12 }}>{a.dataCreazione}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Sezione Entrate Merci Pianificate */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: `1px solid ${colors.grey100}` }}>
              <h3 style={{ fontSize: 15, fontWeight: weight.semibold, color: colors.blue800 }}>{t('cons.empTitle')}</h3>
              <button
                className="btn-secondary"
                onClick={() => { setShowEmpForm(p => !p); setShowAccForm(false); }}
                style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Plus size={13} /> {t('cons.addEmp')}
              </button>
            </div>

            {showEmpForm && (
              <div style={{ padding: 16, background: colors.grey100, borderBottom: `1px solid ${colors.grey300}` }}>
                <p style={{ fontSize: 13, fontWeight: weight.semibold, color: colors.blue800, marginBottom: 12 }}>{t('cons.empFormTitle')}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 2fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: colors.grey800, marginBottom: 4 }}>{t('th.voce')}</label>
                    <select className="select" value={empForm.voceCosto} onChange={e => setEmpForm(p => ({ ...p, voceCosto: e.target.value }))}>
                      <option value="">—</option>
                      {wbs.costi.map(c => <option key={c.voce} value={c.voce}>{c.voce}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: colors.grey800, marginBottom: 4 }}>{t('th.fornitore')}</label>
                    <input type="text" className="input" value={empForm.fornitore} onChange={e => setEmpForm(p => ({ ...p, fornitore: e.target.value }))} placeholder={wbs.fornitore} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: colors.grey800, marginBottom: 4 }}>{t('cons.dataPrevista')}</label>
                    <input type="date" className="input" value={empForm.dataPrevista} onChange={e => setEmpForm(p => ({ ...p, dataPrevista: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: colors.grey800, marginBottom: 4 }}>{t('th.importo')}</label>
                    <input type="number" className="input" value={empForm.importo} onChange={e => setEmpForm(p => ({ ...p, importo: e.target.value }))} placeholder="Es: 50000" min="1" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: colors.grey800, marginBottom: 4 }}>{t('th.note')}</label>
                    <input type="text" className="input" value={empForm.note} onChange={e => setEmpForm(p => ({ ...p, note: e.target.value }))} placeholder={t('pr.notePh')} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-secondary" onClick={handleSaveEmp} style={{ fontSize: 12 }}>{t('cons.save')}</button>
                  <button onClick={() => setShowEmpForm(false)} style={{ fontSize: 12, background: 'none', border: 'none', color: colors.grey800, cursor: 'pointer' }}>{t('common.cancel')}</button>
                </div>
              </div>
            )}

            {localEMP.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: colors.grey800, fontSize: 13 }}>{t('cons.noEmp')}</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr className="table-head">
                    {[t('th.dataPrevista'), t('th.voce'), t('th.fornitore'), t('th.importo'), t('th.stato'), ''].map((h, i) => <th key={i}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {localEMP.map(e => {
                    const canAdvance = EMP_FLOW.indexOf(e.stato) < EMP_FLOW.length - 1;
                    return (
                      <tr key={e.id} style={{ borderBottom: `1px solid ${colors.grey100}` }}>
                        <td style={{ padding: '9px 12px', fontWeight: weight.semibold, color: colors.blue800 }}>{e.dataPrevista}</td>
                        <td style={{ padding: '9px 12px', color: colors.blue800 }}>{e.voceCosto}</td>
                        <td style={{ padding: '9px 12px', color: colors.grey800 }}>{e.fornitore}</td>
                        <td style={{ padding: '9px 12px', fontWeight: weight.semibold, color: colors.azure600 }}>{formatCurrency(e.importo)}</td>
                        <td style={{ padding: '9px 12px' }}>
                          <span className={getEMPStatusColor(e.stato)}>{t(`emstatus.${e.stato}`)}</span>
                        </td>
                        <td style={{ padding: '9px 12px' }}>
                          {canAdvance && (
                            <button
                              className="ghost-link"
                              onClick={() => handleAdvanceEMP(e.id, e.stato)}
                              style={{ fontSize: 12 }}
                            >
                              {t('cons.avanza')}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
