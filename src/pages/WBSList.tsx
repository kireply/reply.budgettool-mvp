import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, Download, ArrowRight } from 'lucide-react';
import { wbsData, areas, years, formatCurrency, getWBSStatusColor, purchaseRequests, impegnatoOf } from '../data/mockData';
import { downloadCsv } from '../utils/csv';
import { colors, weight } from '../theme';
import { useI18n } from '../i18n';

export default function WBSList() {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [filterAnno, setFilterAnno] = useState('');
  const [filterStato, setFilterStato] = useState('');

  const filtered = wbsData.filter(w => {
    const matchSearch = !search ||
      w.codice.toLowerCase().includes(search.toLowerCase()) ||
      w.nome.toLowerCase().includes(search.toLowerCase()) ||
      w.responsabile.toLowerCase().includes(search.toLowerCase());
    const matchArea = !filterArea || w.area === filterArea;
    const matchAnno = !filterAnno || w.anno === Number(filterAnno);
    const matchStato = !filterStato || w.stato === filterStato;
    return matchSearch && matchArea && matchAnno && matchStato;
  });

  const totBudget = filtered.reduce((s, w) => s + w.budgetTotale, 0);
  const totRolling = filtered.reduce((s, w) => s + w.rollingTotale, 0);
  const totImpegnato = filtered.reduce((s, w) => s + impegnatoOf(w.id), 0);

  const handleExport = () => {
    downloadCsv(
      'a2a-wbs.csv',
      [t('th.codice'), t('th.nome'), t('th.area'), t('th.responsabile'), t('wd.anno'), t('th.stato'),
       t('th.budget'), t('th.rolling'), t('th.impegnato'), t('th.disponibile'), t('th.prTot')],
      filtered.map(w => {
        const impegnato = impegnatoOf(w.id);
        return [
          w.codice, w.nome, w.area, w.responsabile, w.anno, t(`wstatus.${w.stato}`),
          w.budgetTotale, w.rollingTotale, impegnato, w.rollingTotale - impegnato,
          purchaseRequests.filter(p => p.wbsId === w.id).length,
        ];
      }),
    );
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: weight.bold, color: colors.blue800, marginBottom: 4 }}>{t('wbs.title')}</h1>
          <p style={{ fontSize: 14, color: colors.grey800 }}>{t('wbs.subtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" onClick={handleExport}>
            <Download size={15} /> {t('wbs.export')}
          </button>
          {/* Primary CTA: all caps + arrow-in-circle (only CDL all-caps exception) */}
          <Link to="/wbs/new" className="cta-primary">
            {t('wbs.new')}
            <span className="cta-circle"><Plus size={15} /></span>
          </Link>
        </div>
      </div>

      {/* Summary — Big Data Items: value in azure 500 */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {[
          { label: t('wbs.shown'), value: filtered.length },
          { label: t('kpi.totalBudget'), value: formatCurrency(totBudget) },
          { label: t('kpi.activeRolling'), value: formatCurrency(totRolling) },
          { label: t('series.committed'), value: formatCurrency(totImpegnato) },
        ].map(({ label, value }) => (
          <div key={label} className="card" style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: colors.grey800, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: weight.bold, color: colors.azure500 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filters — live update, no submit (CDL §18) */}
      <div className="card" style={{ marginBottom: 16, padding: '14px 16px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200 }}>
            <Search size={16} color={colors.azure500} />
            <input
              type="text"
              placeholder={t('wbs.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: 13, width: '100%', color: colors.blue800, background: 'transparent' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Filter size={16} color={colors.grey800} style={{ alignSelf: 'center' }} />
            <select value={filterArea} onChange={e => setFilterArea(e.target.value)} className="select" style={{ width: 'auto', fontSize: 12 }}>
              <option value="">{t('filter.allAreas')}</option>
              {areas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select value={filterAnno} onChange={e => setFilterAnno(e.target.value)} className="select" style={{ width: 'auto', fontSize: 12 }}>
              <option value="">{t('filter.allYears')}</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={filterStato} onChange={e => setFilterStato(e.target.value)} className="select" style={{ width: 'auto', fontSize: 12 }}>
              <option value="">{t('filter.allStates')}</option>
              <option value="Attiva">{t('wstatus.Attiva')}</option>
              <option value="Sospesa">{t('wstatus.Sospesa')}</option>
              <option value="Chiusa">{t('wstatus.Chiusa')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr className="table-head">
              {[t('th.codice'), t('th.nome'), t('th.area'), t('th.responsabile'), t('th.budget'), t('th.rolling'), t('th.impegnato'), t('th.disponibile'), t('th.pr'), t('th.stato'), ''].map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(w => {
              const impegnato = impegnatoOf(w.id);
              const disponibile = w.rollingTotale - impegnato;
              const prs = purchaseRequests.filter(p => p.wbsId === w.id);
              const pctUsato = Math.round(impegnato / w.rollingTotale * 100);
              return (
                <tr key={w.id} style={{ borderBottom: `1px solid ${colors.grey100}` }}>
                  <td style={{ padding: '10px 12px' }}>
                    <Link to={`/wbs/${w.id}`} style={{ color: colors.azure600, fontWeight: weight.bold, textDecoration: 'none', fontSize: 13, transition: 'color 300ms cubic-bezier(0.25, 1, 0.5, 1)' }}>
                      {w.codice}
                    </Link>
                  </td>
                  <td style={{ padding: '10px 12px', maxWidth: 200 }}>
                    <div style={{ fontWeight: weight.medium, color: colors.blue800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.nome}</div>
                    <div style={{ fontSize: 11, color: colors.grey800 }}>{w.legalEntity}</div>
                  </td>
                  <td style={{ padding: '10px 12px', color: colors.grey800, fontSize: 12, whiteSpace: 'nowrap' }}>{w.area}</td>
                  <td style={{ padding: '10px 12px', color: colors.grey800, fontSize: 12 }}>{w.responsabile}</td>
                  <td style={{ padding: '10px 12px', fontWeight: weight.medium, color: colors.blue800 }}>{formatCurrency(w.budgetTotale)}</td>
                  <td style={{ padding: '10px 12px', fontWeight: weight.semibold, color: colors.azure600 }}>{formatCurrency(w.rollingTotale)}</td>
                  <td style={{ padding: '10px 12px', fontWeight: weight.semibold, color: colors.green }}>{formatCurrency(impegnato)}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontWeight: weight.semibold, color: disponibile < 0 ? colors.red : colors.blue800 }}>
                      {formatCurrency(disponibile)}
                    </span>
                    <div style={{ marginTop: 3, width: 64, height: 5, background: colors.grey100, borderRadius: 3 }}>
                      <div style={{ width: `${Math.min(pctUsato, 100)}%`, height: '100%', background: pctUsato > 80 ? colors.red : colors.green, borderRadius: 3, transition: 'width 300ms cubic-bezier(0.25, 1, 0.5, 1)' }} />
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{ background: colors.azure50, color: colors.blue500, borderRadius: 10, padding: '2px 8px', fontSize: 11, fontWeight: weight.semibold }}>
                      {prs.length}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className={getWBSStatusColor(w.stato)}>{t(`wstatus.${w.stato}`)}</span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {/* Ghost link with arrow-right = internal navigation */}
                    <Link to={`/wbs/${w.id}`} className="ghost-link" style={{ fontSize: 12 }}>
                      {t('wbs.detail')} <ArrowRight size={14} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: colors.grey800, fontSize: 14 }}>
            {t('wbs.empty')}
          </div>
        )}
      </div>
    </div>
  );
}
