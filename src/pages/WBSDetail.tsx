import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { ArrowLeft, Plus, TrendingUp, Building2, User, Calendar } from 'lucide-react';
import { wbsData, purchaseRequests, formatCurrency, getStatusColor, getWBSStatusColor } from '../data/mockData';
import { colors, weight, chartColors } from '../theme';
import { useI18n } from '../i18n';

type ScenarioKey = 'budget' | 'rolling' | 'actual';

export default function WBSDetail() {
  const { t, months } = useI18n();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'costi' | 'distribuzione' | 'pr'>('costi');
  const [selectedScenarios, setSelectedScenarios] = useState<ScenarioKey[]>(['budget', 'rolling']);

  const wbs = wbsData.find(w => w.id === id);
  if (!wbs) return (
    <div style={{ padding: 40, textAlign: 'center', color: colors.grey800 }}>
      {t('wd.notFound')} <Link to="/wbs" style={{ color: colors.azure600 }}>{t('wd.backToList')}</Link>
    </div>
  );

  const prs = purchaseRequests.filter(p => p.wbsId === wbs.id);
  const disponibile = wbs.rollingTotale - wbs.impegnato;
  const pctUsato = Math.round(wbs.impegnato / wbs.rollingTotale * 100);

  // Monthly distribution data from first cost entry; month labels follow the active language
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

  return (
    <div className="animate-in">
      {/* Breadcrumb — every level clickable except current (CDL §17) */}
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
        {/* Primary CTA: all caps + arrow-in-circle */}
        <Link to={`/purchase-requests/new?wbs=${wbs.id}`} className="cta-primary">
          {t('wd.createPR')}
          <span className="cta-circle"><Plus size={15} /></span>
        </Link>
      </div>

      {/* Info + KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 16, marginBottom: 24 }}>
        {/* Anagrafica */}
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

        {/* Budget KPI — Big Data Items: value in azure (CDL §34) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { label: t('kpi.initialBudget'), value: formatCurrency(wbs.budgetTotale), color: chartColors.budget },
              { label: t('wd.activeRolling'), value: formatCurrency(wbs.rollingTotale), color: colors.azure500 },
              { label: t('wd.committedKpi'), value: formatCurrency(wbs.impegnato), color: colors.orange },
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
              <span>{t('wd.committedLabel', { value: formatCurrency(wbs.impegnato) })}</span>
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

      {/* Tabs — anchor-link style (CDL §16) */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `2px solid ${colors.grey300}`, marginBottom: 20 }}>
        {[
          { key: 'costi', label: t('tab.costs') },
          { key: 'distribuzione', label: t('tab.distribution') },
          { key: 'pr', label: t('tab.pr', { n: prs.length }) },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as typeof activeTab)}
            className={`tab ${activeTab === key ? 'active' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
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
    </div>
  );
}
