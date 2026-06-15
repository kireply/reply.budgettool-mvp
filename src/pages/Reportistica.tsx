import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Legend, LineChart, Line, CartesianGrid,
} from 'recharts';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import { wbsData, purchaseRequests, formatCurrency, impegnatoOf, accertatoOf } from '../data/mockData';
import { downloadCsv } from '../utils/csv';
import { colors, weight, chartColors } from '../theme';
import { useI18n } from '../i18n';

export default function Reportistica() {
  const { t, months } = useI18n();
  const [view, setView] = useState<'area' | 'wbs' | 'trend'>('area');

  // Aggregate by area
  const areaData = Object.values(
    wbsData.reduce((acc, w) => {
      if (!acc[w.area]) acc[w.area] = { area: w.area, budget: 0, rolling: 0, impegnato: 0, actual: 0 };
      acc[w.area].budget += w.budgetTotale;
      acc[w.area].rolling += w.rollingTotale;
      acc[w.area].impegnato += impegnatoOf(w.id);
      acc[w.area].actual += w.actual;
      return acc;
    }, {} as Record<string, { area: string; budget: number; rolling: number; impegnato: number; actual: number }>)
  );

  // Monthly cumulative trend
  const trendData = months.map((month, i) => {
    let budget = 0, rolling = 0, actual = 0;
    wbsData.forEach(w => {
      w.costi.forEach(c => {
        budget += c.monthly[i].budget;
        rolling += c.monthly[i].rolling;
        actual += c.monthly[i].actual;
      });
    });
    return { month, budget, rolling, actual };
  });

  // Cumulative
  let cumBudget = 0, cumRolling = 0, cumActual = 0;
  const cumulativeTrend = trendData.map(d => {
    cumBudget += d.budget;
    cumRolling += d.rolling;
    cumActual += d.actual;
    return { month: d.month, budget: cumBudget, rolling: cumRolling, actual: cumActual };
  });

  const totalBudget = wbsData.reduce((s, w) => s + w.budgetTotale, 0);
  const totalRolling = wbsData.reduce((s, w) => s + w.rollingTotale, 0);
  const totalImpegnato = wbsData.reduce((s, w) => s + impegnatoOf(w.id), 0);
  const totalActual = wbsData.reduce((s, w) => s + w.actual, 0);
  const totalAccertato = wbsData.reduce((s, w) => s + accertatoOf(w.id), 0);

  // Variance analysis
  const varianceData = wbsData.map(w => {
    const impegnato = impegnatoOf(w.id);
    return {
      name: w.codice,
      fullName: w.nome,
      delta: w.rollingTotale - w.budgetTotale,
      pctDelta: Math.round((w.rollingTotale / w.budgetTotale - 1) * 100),
      impegnato,
      disponibile: w.rollingTotale - impegnato,
    };
  });

  // Export del dataset della vista attiva
  const handleExport = () => {
    if (view === 'area') {
      downloadCsv(
        'report-aree.csv',
        [t('th.area'), t('series.budget'), t('series.rolling'), t('series.committed'), t('series.actual')],
        areaData.map(a => [a.area, a.budget, a.rolling, a.impegnato, a.actual]),
      );
    } else if (view === 'wbs') {
      downloadCsv(
        'report-scostamenti.csv',
        [t('th.codice'), t('th.nomeShort'), t('th.budget'), t('th.rolling'), t('th.scostamento'),
         t('th.pctScost'), t('th.impegnato'), t('th.disponibile'), t('th.accertato'), t('th.prTot')],
        wbsData.map(w => {
          const v = varianceData.find(x => x.name === w.codice)!;
          return [
            w.codice, w.nome, w.budgetTotale, w.rollingTotale, v.delta, v.pctDelta,
            v.impegnato, v.disponibile, accertatoOf(w.id), purchaseRequests.filter(p => p.wbsId === w.id).length,
          ];
        }),
      );
    } else {
      downloadCsv(
        'report-trend.csv',
        [t('th.mese'), t('series.budget'), t('series.rolling'), t('series.actual'),
         t('series.budgetCum'), t('series.rollingCum'), t('series.actualCum')],
        trendData.map((d, i) => [
          d.month, d.budget, d.rolling, d.actual,
          cumulativeTrend[i].budget, cumulativeTrend[i].rolling, cumulativeTrend[i].actual,
        ]),
      );
    }
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: weight.bold, color: colors.blue800, marginBottom: 4 }}>{t('rep.title')}</h1>
          <p style={{ fontSize: 14, color: colors.grey800 }}>{t('rep.subtitle')}</p>
        </div>
        {/* download icon = file download (CDL semantic icon mapping) */}
        <button className="btn-secondary" onClick={handleExport}>
          <Download size={15} /> {t('rep.export')}
        </button>
      </div>

      {/* KPI Summary — Big Data Items */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: t('kpi.initialBudget'), value: formatCurrency(totalBudget), sub: t('rep.approvedScenario'), color: chartColors.budget, trend: null },
          { label: t('kpi.activeRolling'), value: formatCurrency(totalRolling), sub: t('kpi.vsBudget', { pct: Math.round((totalRolling/totalBudget-1)*100) }), color: colors.azure500, trend: 'up' },
          { label: t('series.committed'), value: formatCurrency(totalImpegnato), sub: t('kpi.ofRolling', { pct: Math.round(totalImpegnato/totalRolling*100) }), color: colors.orange, trend: null },
          { label: t('cons.totale'), value: formatCurrency(totalActual + totalAccertato), sub: `${t('cons.sapActual')}: ${formatCurrency(totalActual)} + ${formatCurrency(totalAccertato)} ${t('cons.accertato').toLowerCase()}`, color: colors.blue800, trend: null },
        ].map(({ label, value, sub, color, trend }) => (
          <div key={label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: colors.grey800, marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 21, fontWeight: weight.bold, color, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 11, color: trend === 'up' ? colors.red : trend === 'down' ? colors.green : colors.grey800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
              {trend === 'up' && <TrendingUp size={12} />}
              {trend === 'down' && <TrendingDown size={12} />}
              {sub}
            </div>
          </div>
        ))}
      </div>

      {/* View Tabs — anchor-link style */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `2px solid ${colors.grey300}`, marginBottom: 20 }}>
        {[
          { key: 'area', label: t('rep.tabArea') },
          { key: 'wbs', label: t('rep.tabWbs') },
          { key: 'trend', label: t('rep.tabTrend') },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setView(key as typeof view)}
            className={`tab ${view === key ? 'active' : ''}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Area View */}
      {view === 'area' && (
        <div className="animate-in" style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16 }}>
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: weight.semibold, color: colors.blue800, marginBottom: 16 }}>
              {t('rep.chartArea')}
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={areaData} margin={{ bottom: 40 }}>
                <XAxis dataKey="area" tick={{ fontSize: 11, fill: colors.grey800 }} angle={-25} textAnchor="end" />
                <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: colors.grey800 }} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                {/* legend on top: rotated x labels would overlap a bottom legend */}
                <Legend verticalAlign="top" wrapperStyle={{ fontSize: 12, paddingBottom: 12 }} />
                <Bar isAnimationActive={false} dataKey="budget" name={t('series.budget')} fill={chartColors.budget} radius={[4,4,0,0]} opacity={0.85} />
                <Bar isAnimationActive={false} dataKey="rolling" name={t('series.rolling')} fill={chartColors.rolling} radius={[4,4,0,0]} />
                <Bar isAnimationActive={false} dataKey="impegnato" name={t('series.committed')} fill={chartColors.impegnato} radius={[4,4,0,0]} />
                <Bar isAnimationActive={false} dataKey="actual" name={t('series.actual')} fill={chartColors.actual} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: weight.semibold, color: colors.blue800, marginBottom: 16 }}>{t('rep.areaSummary')}</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr className="table-head">
                    {[t('th.area'), t('th.rolling'), t('th.impegnato'), t('th.uso')].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {areaData.map(a => {
                    const pct = Math.round(a.impegnato / a.rolling * 100);
                    return (
                      <tr key={a.area} style={{ borderBottom: `1px solid ${colors.grey100}` }}>
                        <td style={{ padding: '8px 12px', fontSize: 11, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: colors.blue800 }}>{a.area}</td>
                        <td style={{ padding: '8px 12px', fontWeight: weight.semibold, color: colors.azure600 }}>{formatCurrency(a.rolling)}</td>
                        <td style={{ padding: '8px 12px', color: colors.green }}>{formatCurrency(a.impegnato)}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 40, height: 5, background: colors.grey100, borderRadius: 3 }}>
                              <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: pct > 80 ? colors.red : colors.green, borderRadius: 3, transition: 'width 300ms cubic-bezier(0.25, 1, 0.5, 1)' }} />
                            </div>
                            <span style={{ fontSize: 11, color: colors.grey800 }}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* WBS Variance */}
      {view === 'wbs' && (
        <div className="card animate-in">
          <h3 style={{ fontSize: 16, fontWeight: weight.semibold, color: colors.blue800, marginBottom: 16 }}>{t('rep.varianceTitle')}</h3>
          <div style={{ marginBottom: 16 }}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={varianceData} margin={{ bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: colors.grey800 }} />
                <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: colors.grey800 }} />
                <Tooltip formatter={(v, name) => [formatCurrency(Number(v)), name]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grey100} />
                <Bar isAnimationActive={false} dataKey="delta" name={t('series.variance')} fill={chartColors.impegnato} radius={[4,4,0,0]} />
                <Bar isAnimationActive={false} dataKey="disponibile" name={t('series.available')} fill={chartColors.actual} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr className="table-head">
                {[t('th.codice'), t('th.nomeShort'), t('th.budget'), t('th.rolling'), t('th.scostamento'), t('th.pctScost'), t('th.impegnato'), t('th.disponibile'), t('th.accertato'), t('th.prTot')].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {wbsData.map(w => {
                const delta = w.rollingTotale - w.budgetTotale;
                const pct = Math.round((w.rollingTotale / w.budgetTotale - 1) * 100);
                const prs = purchaseRequests.filter(p => p.wbsId === w.id);
                const impegnato = impegnatoOf(w.id);
                return (
                  <tr key={w.id} style={{ borderBottom: `1px solid ${colors.grey100}` }}>
                    <td style={{ padding: '9px 12px', fontWeight: weight.bold, color: colors.azure600 }}>{w.codice}</td>
                    <td style={{ padding: '9px 12px', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: colors.blue800 }}>{w.nome}</td>
                    <td style={{ padding: '9px 12px', color: colors.blue800 }}>{formatCurrency(w.budgetTotale)}</td>
                    <td style={{ padding: '9px 12px', fontWeight: weight.semibold, color: colors.azure600 }}>{formatCurrency(w.rollingTotale)}</td>
                    <td style={{ padding: '9px 12px', color: delta > 0 ? colors.red : colors.green, fontWeight: weight.semibold }}>
                      {delta > 0 ? '+' : ''}{formatCurrency(delta)}
                    </td>
                    <td style={{ padding: '9px 12px', color: pct > 0 ? colors.red : colors.green, fontWeight: weight.semibold }}>
                      {pct > 0 ? '+' : ''}{pct}%
                    </td>
                    <td style={{ padding: '9px 12px', color: colors.orange }}>{formatCurrency(impegnato)}</td>
                    <td style={{ padding: '9px 12px', fontWeight: weight.semibold, color: w.rollingTotale - impegnato < 0 ? colors.red : colors.blue800 }}>
                      {formatCurrency(w.rollingTotale - impegnato)}
                    </td>
                    <td style={{ padding: '9px 12px', color: colors.azure600 }}>
                      {formatCurrency(accertatoOf(w.id))}
                    </td>
                    <td style={{ padding: '9px 12px' }}>
                      <span style={{ background: colors.azure50, color: colors.blue500, borderRadius: 10, padding: '2px 8px', fontSize: 11, fontWeight: weight.semibold }}>
                        {prs.length}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Trend */}
      {view === 'trend' && (
        <div className="animate-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: weight.semibold, color: colors.blue800, marginBottom: 16 }}>{t('rep.monthlySpend')}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trendData}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: colors.grey800 }} />
                <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: colors.grey800 }} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar isAnimationActive={false} dataKey="budget" name={t('series.budget')} fill={chartColors.budget} radius={[3,3,0,0]} opacity={0.85} />
                <Bar isAnimationActive={false} dataKey="rolling" name={t('series.rolling')} fill={chartColors.rolling} radius={[3,3,0,0]} />
                <Bar isAnimationActive={false} dataKey="actual" name={t('series.actual')} fill={chartColors.impegnato} radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: weight.semibold, color: colors.blue800, marginBottom: 16 }}>{t('rep.cumulative')}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={cumulativeTrend}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: colors.grey800 }} />
                <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: colors.grey800 }} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grey100} />
                <Line isAnimationActive={false} type="monotone" dataKey="budget" name={t('series.budgetCum')} stroke={chartColors.budget} strokeWidth={2} dot={false} />
                <Line isAnimationActive={false} type="monotone" dataKey="rolling" name={t('series.rollingCum')} stroke={chartColors.rolling} strokeWidth={2} dot={false} strokeDasharray="5 3" />
                <Line isAnimationActive={false} type="monotone" dataKey="actual" name={t('series.actualCum')} stroke={chartColors.impegnato} strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
