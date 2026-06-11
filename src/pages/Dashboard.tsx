import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { wbsData, purchaseRequests, formatCurrency, impegnatoOf } from '../data/mockData';
import { colors, weight, chartColors } from '../theme';
import { useI18n } from '../i18n';

export default function Dashboard() {
  const { t } = useI18n();
  const [drillArea, setDrillArea] = useState<string | null>(null);

  const totalBudget = wbsData.reduce((s, w) => s + w.budgetTotale, 0);
  const totalRolling = wbsData.reduce((s, w) => s + w.rollingTotale, 0);
  const totalImpegnato = wbsData.reduce((s, w) => s + impegnatoOf(w.id), 0);
  const totalActual = wbsData.reduce((s, w) => s + w.actual, 0);

  const prByStatus = purchaseRequests.reduce((acc, pr) => {
    acc[pr.stato] = (acc[pr.stato] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const areaData = Object.entries(
    wbsData.reduce((acc, w) => {
      if (!acc[w.area]) acc[w.area] = { area: w.area, pianificato: 0, impegnato: 0, actual: 0 };
      acc[w.area].pianificato += w.rollingTotale;
      acc[w.area].impegnato += impegnatoOf(w.id);
      acc[w.area].actual += w.actual;
      return acc;
    }, {} as Record<string, { area: string; pianificato: number; impegnato: number; actual: number }>)
  ).map(([, v]) => v);

  const pieData = areaData.map(d => ({ name: d.area, value: d.pianificato }));

  const filteredWBS = drillArea
    ? wbsData.filter(w => w.area === drillArea)
    : wbsData;

  // Big Data Item per CDL: value in azure 500, unit/label separated
  const kpiCard = (label: string, value: string, sub: string, icon: React.ReactNode, color: string) => (
    <div className="card" style={{ flex: 1, minWidth: 180 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 12, color: colors.grey800, marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 24, fontWeight: weight.bold, color: colors.azure500 }}>{value}</div>
          <div style={{ fontSize: 11, color: colors.grey800, marginTop: 4 }}>{sub}</div>
        </div>
        <div style={{ background: color + '1A', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: weight.bold, color: colors.blue800, marginBottom: 4 }}>{t('dash.title')}</h1>
        <p style={{ fontSize: 14, color: colors.grey800 }}>{t('dash.subtitle')}</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {kpiCard(t('kpi.totalBudget'), formatCurrency(totalBudget), t('kpi.budgetScenario'), <TrendingUp size={20} />, colors.azure500)}
        {kpiCard(t('kpi.activeRolling'), formatCurrency(totalRolling), t('kpi.vsBudget', { pct: Math.round((totalRolling/totalBudget - 1)*100) }), <TrendingUp size={20} />, colors.green)}
        {kpiCard(t('kpi.committed'), formatCurrency(totalImpegnato), t('kpi.ofRolling', { pct: Math.round(totalImpegnato/totalRolling*100) }), <AlertCircle size={20} />, colors.orange)}
        {kpiCard(t('kpi.actual'), formatCurrency(totalActual), t('kpi.ofRolling', { pct: Math.round(totalActual/totalRolling*100) }), <CheckCircle size={20} />, colors.green)}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Bar Chart */}
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: weight.semibold, color: colors.blue800, marginBottom: 16 }}>
            {t('dash.chartPlannedCommitted')}
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={areaData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
              <XAxis dataKey="area" tick={{ fontSize: 11, fill: colors.grey800 }} angle={-30} textAnchor="end" interval={0} />
              <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: colors.grey800 }} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              {/* legend on top: rotated x labels would overlap a bottom legend */}
              <Legend verticalAlign="top" wrapperStyle={{ fontSize: 12, paddingBottom: 12 }} />
              <Bar isAnimationActive={false} dataKey="pianificato" name={t('series.planned')} fill={chartColors.rolling} radius={[4,4,0,0]}
                onClick={(d) => {
                  const area = (d as unknown as { area: string }).area;
                  setDrillArea(drillArea === area ? null : area);
                }} style={{ cursor: 'pointer' }} />
              <Bar isAnimationActive={false} dataKey="impegnato" name={t('series.committed')} fill={chartColors.impegnato} radius={[4,4,0,0]} />
              <Bar isAnimationActive={false} dataKey="actual" name={t('series.actual')} fill={chartColors.actual} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          {drillArea && (
            <div style={{ marginTop: 8, fontSize: 12, color: colors.azure600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>{t('dash.drillActive')} <strong>{drillArea}</strong></span>
              <button onClick={() => setDrillArea(null)} className="btn-secondary" style={{ marginLeft: 8, fontSize: 11, padding: '4px 12px' }}>
                {t('common.reset')}
              </button>
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: weight.semibold, color: colors.blue800, marginBottom: 16 }}>
            {t('dash.rollingDistribution')}
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie isAnimationActive={false} data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={90}
                dataKey="value" nameKey="name">
                {pieData.map((_, i) => <Cell key={i} fill={chartColors.series[i % chartColors.series.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PR Status + WBS Drill-down */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
        {/* PR Status */}
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: weight.semibold, color: colors.blue800, marginBottom: 16 }}>
            {t('dash.prStatus')}
          </h2>
          {[
            { stato: 'Approvata', color: colors.green, icon: <CheckCircle size={14} /> },
            { stato: 'Inviata a SAP', color: colors.blue500, icon: <Clock size={14} /> },
            { stato: 'Inviata', color: colors.orange, icon: <Clock size={14} /> },
            { stato: 'Bozza', color: colors.grey800, icon: <AlertCircle size={14} /> },
            { stato: 'Rifiutata', color: colors.red, icon: <TrendingDown size={14} /> },
          ].map(({ stato, color, icon }) => (
            <div key={stato} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${colors.grey100}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color, fontSize: 13 }}>
                {icon}{t(`status.${stato}`)}
              </div>
              <span style={{ background: color + '1A', color, borderRadius: 12, padding: '2px 10px', fontSize: 12, fontWeight: weight.semibold }}>
                {prByStatus[stato] || 0}
              </span>
            </div>
          ))}
          <Link to="/purchase-requests" className="ghost-link" style={{ marginTop: 16 }}>
            {t('dash.seeAllPR')} <ArrowRight size={14} />
          </Link>
        </div>

        {/* WBS Drill-down Table */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: weight.semibold, color: colors.blue800 }}>
              {drillArea ? `WBS — ${drillArea}` : t('dash.wbsDetail')}
            </h2>
            <Link to="/wbs" className="ghost-link" style={{ fontSize: 12 }}>
              {t('dash.manageWBS')} <ArrowRight size={13} />
            </Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr className="table-head">
                  {[t('th.wbs'), t('th.responsabile'), t('th.rolling'), t('th.impegnato'), t('th.uso'), t('th.pr')].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredWBS.map(w => {
                  const prs = purchaseRequests.filter(p => p.wbsId === w.id);
                  const impegnato = impegnatoOf(w.id);
                  const pct = Math.round(impegnato / w.rollingTotale * 100);
                  return (
                    <tr key={w.id} style={{ borderBottom: `1px solid ${colors.grey100}` }}>
                      <td style={{ padding: '8px 12px' }}>
                        <Link to={`/wbs/${w.id}`} style={{ color: colors.azure600, textDecoration: 'none', fontWeight: weight.semibold, transition: 'color 300ms cubic-bezier(0.25, 1, 0.5, 1)' }}>
                          {w.codice}
                        </Link>
                        <div style={{ fontSize: 11, color: colors.grey800 }}>{w.nome.substring(0, 30)}</div>
                      </td>
                      <td style={{ padding: '8px 12px', color: colors.grey800, fontSize: 12 }}>{w.responsabile.split(' ')[0]}</td>
                      <td style={{ padding: '8px 12px', fontWeight: weight.semibold, color: colors.blue800 }}>{formatCurrency(w.rollingTotale)}</td>
                      <td style={{ padding: '8px 12px', color: colors.green, fontWeight: weight.semibold }}>{formatCurrency(impegnato)}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 48, height: 6, background: colors.grey100, borderRadius: 3 }}>
                            <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: pct > 80 ? colors.red : colors.green, borderRadius: 3, transition: 'width 300ms cubic-bezier(0.25, 1, 0.5, 1)' }} />
                          </div>
                          <span style={{ fontSize: 11, color: pct > 80 ? colors.red : colors.grey800 }}>{pct}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
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
        </div>
      </div>
    </div>
  );
}
