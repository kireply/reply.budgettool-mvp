import { useMemo } from 'react';
import { budgetLines, wbsData, impegnatoOf, formatCurrency } from '../data/mockData';
import { colors, weight } from '../theme';
import { useI18n } from '../i18n';
import { Layers } from 'lucide-react';

export default function BudgetLines() {
  const { t } = useI18n();

  const rows = useMemo(() => budgetLines.map(bl => {
    const linkedWBS = wbsData.filter(w => w.budgetLineId === bl.id);
    const rollingTotale = linkedWBS.reduce((s, w) => s + w.rollingTotale, 0);
    const impegnato = linkedWBS.reduce((s, w) => s + impegnatoOf(w.id), 0);
    const actual = linkedWBS.reduce((s, w) => s + w.actual, 0);
    const pctUso = bl.budgetTotale > 0 ? Math.round((rollingTotale / bl.budgetTotale) * 100) : 0;
    return { bl, linkedWBS, rollingTotale, impegnato, actual, pctUso };
  }), []);

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: weight.bold, color: colors.blue800, margin: 0 }}>
          {t('bl.title')}
        </h1>
        <p style={{ marginTop: 8, color: colors.grey800, fontSize: 14 }}>
          {t('bl.subtitle')}
        </p>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: t('kpi.totalBudget'), value: formatCurrency(budgetLines.reduce((s, bl) => s + bl.budgetTotale, 0)) },
          { label: t('kpi.activeRolling'), value: formatCurrency(rows.reduce((s, r) => s + r.rollingTotale, 0)) },
          { label: t('kpi.committed'), value: formatCurrency(rows.reduce((s, r) => s + r.impegnato, 0)) },
        ].map(({ label, value }) => (
          <div key={label} className="card" style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 12, color: colors.grey800, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: weight.bold, color: colors.blue800 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse' }}>
          <thead>
            <tr className="table-head">
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12 }}>{t('bl.codice')}</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12 }}>{t('th.nome')}</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12 }}>{t('bl.area')}</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12 }}>{t('bl.responsabile')}</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12 }}>{t('bl.totalBudget')}</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12 }}>{t('kpi.activeRolling')}</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12 }}>{t('kpi.committed')}</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12 }}>{t('kpi.actual')}</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12 }}>{t('bl.linkedWBS')}</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12 }}>{t('th.uso')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ bl, linkedWBS, rollingTotale, impegnato, actual, pctUso }, idx) => (
              <tr key={bl.id} style={{ borderBottom: `1px solid ${colors.grey300}`, background: idx % 2 === 0 ? 'white' : colors.grey100 }}>
                <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: 'monospace', color: colors.azure500 }}>
                  {bl.codice}
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: weight.medium, color: colors.blue800 }}>
                  {bl.nome}
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: colors.grey800 }}>{bl.area}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: colors.grey800 }}>{bl.responsabile}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, textAlign: 'right', fontWeight: weight.medium }}>
                  {formatCurrency(bl.budgetTotale)}
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, textAlign: 'right', color: colors.azure500 }}>
                  {formatCurrency(rollingTotale)}
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, textAlign: 'right', color: colors.orange }}>
                  {formatCurrency(impegnato)}
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, textAlign: 'right', color: colors.green }}>
                  {formatCurrency(actual)}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: colors.grey100, borderRadius: 12,
                    padding: '2px 10px', fontSize: 12, color: colors.blue800,
                  }}>
                    <Layers size={12} />
                    {t('bl.wbsCount').replace('{n}', String(linkedWBS.length))}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <span style={{
                    fontSize: 12, fontWeight: weight.medium,
                    color: pctUso > 100 ? colors.red : pctUso > 80 ? colors.orange : colors.green,
                  }}>
                    {pctUso}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
