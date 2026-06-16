import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Plus, Trash2, ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';
import {
  wbsData, areas, years, vociCosto, fornitori, legalEntities, MONTHS,
  formatCurrency, addWBS, type WBS, type CostEntry, type CostType,
} from '../data/mockData';
import { colors, weight } from '../theme';
import { useI18n } from '../i18n';

interface CostRow {
  voce: string;
  tipo: CostType;
  budget: string;
  monthly: number[];
  monthlyTouched: boolean;
  open: boolean;
}

function uniformSplit(total: number): number[] {
  const base = Math.floor(total / 12);
  const arr = Array(12).fill(base);
  arr[11] = total - base * 11;
  return arr;
}

const emptyRow = (): CostRow => ({
  voce: '', tipo: 'Opex', budget: '', monthly: Array(12).fill(0), monthlyTouched: false, open: false,
});

const FIELD_ORDER = ['codice', 'nome', 'area', 'responsabile', 'centroCosto', 'legalEntity', 'anno', 'costs'];

export default function WBSNew() {
  const { t, months } = useI18n();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    codice: '', nome: '', area: '', responsabile: '',
    centroCosto: '', legalEntity: '', fornitore: '', anno: String(new Date().getFullYear()),
  });
  const [rows, setRows] = useState<CostRow[]>([emptyRow()]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const setField = (key: keyof typeof form, value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const blur = (key: string) => setTouched(prev => ({ ...prev, [key]: true }));

  // ---- Validation ----
  const errors: Record<string, string> = {};
  if (!form.codice.trim()) errors.codice = t('err.required');
  else if (wbsData.some(w => w.codice.toLowerCase() === form.codice.trim().toLowerCase()))
    errors.codice = t('err.codiceDup');
  if (!form.nome.trim()) errors.nome = t('err.required');
  if (!form.area) errors.area = t('err.required');
  if (!form.responsabile.trim()) errors.responsabile = t('err.required');
  if (!form.centroCosto.trim()) errors.centroCosto = t('err.required');
  if (!form.legalEntity) errors.legalEntity = t('err.required');
  if (!form.anno) errors.anno = t('err.required');

  const validRows = rows.filter(r => r.voce && (parseFloat(r.budget) || 0) > 0);
  if (validRows.length === 0) errors.costs = t('err.noCosts');
  rows.forEach((r, i) => {
    const b = parseFloat(r.budget) || 0;
    if (r.voce && b > 0 && r.monthly.reduce((s, v) => s + v, 0) !== b) {
      errors[`cost-${i}`] = t('err.monthSum');
    }
  });

  const showError = (key: string) => (touched[key] || submitted) && errors[key];

  const totalBudget = rows.reduce((s, r) => s + (parseFloat(r.budget) || 0), 0);

  // ---- Cost row handlers ----
  const updateRow = (i: number, patch: Partial<CostRow>) =>
    setRows(prev => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const setRowBudget = (i: number, value: string) => {
    const b = parseFloat(value) || 0;
    setRows(prev => prev.map((r, idx) => {
      if (idx !== i) return r;
      return { ...r, budget: value, monthly: r.monthlyTouched ? r.monthly : uniformSplit(b) };
    }));
  };

  const setRowMonth = (i: number, m: number, value: string) =>
    setRows(prev => prev.map((r, idx) => {
      if (idx !== i) return r;
      const monthly = [...r.monthly];
      monthly[m] = parseFloat(value) || 0;
      return { ...r, monthly, monthlyTouched: true };
    }));

  const redistribute = (i: number) =>
    setRows(prev => prev.map((r, idx) =>
      idx === i ? { ...r, monthly: uniformSplit(parseFloat(r.budget) || 0), monthlyTouched: false } : r
    ));

  // ---- Submit ----
  // CDL forms rule: on submit with errors, scroll to 96px above the first error field
  const scrollToFirstError = () => {
    const firstKey = FIELD_ORDER.concat(rows.map((_, i) => `cost-${i}`)).find(k => errors[k]);
    if (!firstKey) return;
    const el = document.getElementById(`field-${firstKey === 'costs' || firstKey.startsWith('cost-') ? 'costs' : firstKey}`);
    const main = el?.closest('main');
    if (el && main) {
      const top = el.getBoundingClientRect().top - main.getBoundingClientRect().top + main.scrollTop;
      main.scrollTo({ top: Math.max(top - 96, 0), behavior: 'smooth' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) {
      scrollToFirstError();
      return;
    }

    const costi: CostEntry[] = validRows.map(r => {
      const b = parseFloat(r.budget) || 0;
      return {
        voce: r.voce,
        tipo: r.tipo,
        budget: b,
        rolling: b, // rolling scenario starts equal to budget at creation
        actual: 0,
        monthly: r.monthly.map((v, i) => ({ month: MONTHS[i], budget: v, rolling: v, actual: 0 })),
      };
    });

    const total = costi.reduce((s, c) => s + c.budget, 0);
    const newWBS: WBS = {
      id: `wbs-${Date.now()}`,
      codice: form.codice.trim(),
      nome: form.nome.trim(),
      responsabile: form.responsabile.trim(),
      area: form.area,
      centroCosto: form.centroCosto.trim(),
      legalEntity: form.legalEntity,
      fornitore: form.fornitore || 'TBD',
      anno: Number(form.anno),
      stato: 'Attiva',
      budgetTotale: total,
      rollingTotale: total,
      actual: 0,
      budgetLineId: '',
      costi,
    };
    addWBS(newWBS);
    navigate(`/wbs/${newWBS.id}`);
  };

  // ---- UI helpers ----
  const label = (text: string) => (
    <label style={{ fontSize: 12, color: colors.blue800, fontWeight: weight.semibold, display: 'block', marginBottom: 4 }}>
      {text}
    </label>
  );

  const errorText = (key: string) => showError(key) ? (
    <div className="animate-in" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 11, color: colors.red }}>
      <AlertCircle size={12} /> {errors[key]}
    </div>
  ) : null;

  const errStyle = (key: string) => showError(key) ? { borderColor: colors.red } : undefined;

  return (
    <div className="animate-in">
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 13, color: colors.grey800 }}>
        <Link to="/wbs" className="ghost-link" style={{ fontWeight: weight.medium }}>
          <ArrowLeft size={15} /> {t('wbs.title')}
        </Link>
        <span>/</span>
        <span>{t('wnew.title')}</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: weight.bold, color: colors.blue800, marginBottom: 4 }}>{t('wnew.title')}</h1>
        <p style={{ fontSize: 14, color: colors.grey800 }}>{t('wnew.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Master data */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: weight.semibold, color: colors.blue800, marginBottom: 16 }}>{t('wd.registry')}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div id="field-codice">
              {label(t('wnew.codice'))}
              <input className="input" style={errStyle('codice')} placeholder={t('wnew.codicePh')}
                value={form.codice} onChange={e => setField('codice', e.target.value)} onBlur={() => blur('codice')} />
              {errorText('codice')}
            </div>
            <div id="field-nome">
              {label(t('wnew.nome'))}
              <input className="input" style={errStyle('nome')} placeholder={t('wnew.nomePh')}
                value={form.nome} onChange={e => setField('nome', e.target.value)} onBlur={() => blur('nome')} />
              {errorText('nome')}
            </div>
            <div id="field-area">
              {label(t('wnew.area'))}
              <select className="select" style={errStyle('area')} value={form.area}
                onChange={e => setField('area', e.target.value)} onBlur={() => blur('area')}>
                <option value="">{t('wnew.selectArea')}</option>
                {areas.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              {errorText('area')}
            </div>
            <div id="field-responsabile">
              {label(t('wnew.responsabile'))}
              <input className="input" style={errStyle('responsabile')} placeholder={t('wnew.responsabilePh')}
                value={form.responsabile} onChange={e => setField('responsabile', e.target.value)} onBlur={() => blur('responsabile')} />
              {errorText('responsabile')}
            </div>
            <div id="field-centroCosto">
              {label(t('wnew.centroCosto'))}
              <input className="input" style={errStyle('centroCosto')} placeholder={t('wnew.centroCostoPh')}
                value={form.centroCosto} onChange={e => setField('centroCosto', e.target.value)} onBlur={() => blur('centroCosto')} />
              {errorText('centroCosto')}
            </div>
            <div id="field-legalEntity">
              {label(t('wd.legalEntity') + ' *')}
              <select className="select" style={errStyle('legalEntity')} value={form.legalEntity}
                onChange={e => setField('legalEntity', e.target.value)} onBlur={() => blur('legalEntity')}>
                <option value="">{t('wnew.selectLegalEntity')}</option>
                {legalEntities.map(le => <option key={le} value={le}>{le}</option>)}
              </select>
              {errorText('legalEntity')}
            </div>
            <div>
              {label(t('wd.fornitore'))}
              <select className="select" value={form.fornitore} onChange={e => setField('fornitore', e.target.value)}>
                <option value="">{t('pr.tbd')}</option>
                {fornitori.filter(f => f !== 'TBD').map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div id="field-anno">
              {label(t('wnew.anno'))}
              <select className="select" style={errStyle('anno')} value={form.anno}
                onChange={e => setField('anno', e.target.value)} onBlur={() => blur('anno')}>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              {errorText('anno')}
            </div>
          </div>
        </div>

        {/* Cost items */}
        <div className="card" id="field-costs" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <h3 style={{ fontSize: 16, fontWeight: weight.semibold, color: colors.blue800 }}>{t('tab.costs')}</h3>
            <button type="button" className="btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }}
              onClick={() => setRows(prev => [...prev, emptyRow()])}>
              <Plus size={14} /> {t('wnew.addCost')}
            </button>
          </div>
          <p style={{ fontSize: 12, color: colors.grey800, marginBottom: 16 }}>{t('wnew.costsHint')}</p>
          {showError('costs') && errorText('costs')}

          {rows.map((row, i) => {
            const b = parseFloat(row.budget) || 0;
            const monthSum = row.monthly.reduce((s, v) => s + v, 0);
            const sumOk = monthSum === b;
            return (
              <div key={i} style={{
                border: `1px solid ${showError(`cost-${i}`) ? colors.red : colors.grey300}`,
                borderRadius: 12, padding: 16, marginBottom: 12,
                transition: 'border-color 300ms cubic-bezier(0.25, 1, 0.5, 1)',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
                  <div>
                    {label(t('th.voce'))}
                    <select className="select" value={row.voce} onChange={e => updateRow(i, { voce: e.target.value })}>
                      <option value="">{t('pr.selectVoce')}</option>
                      {vociCosto.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    {label(t('th.tipo'))}
                    <select className="select" value={row.tipo} onChange={e => updateRow(i, { tipo: e.target.value as CostType })}>
                      <option value="Opex">Opex</option>
                      <option value="Capex">Capex</option>
                    </select>
                  </div>
                  <div>
                    {label(t('wnew.budgetImporto'))}
                    <input className="input" type="number" min="0" placeholder={t('pr.importoPh')}
                      value={row.budget} onChange={e => setRowBudget(i, e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', gap: 4, paddingBottom: 2 }}>
                    <button type="button" title={row.open ? t('wnew.hideMonths') : t('wnew.showMonths')}
                      onClick={() => updateRow(i, { open: !row.open })}
                      style={{
                        width: 32, height: 32, borderRadius: '50%', border: `1px solid ${colors.grey300}`,
                        background: row.open ? colors.azure50 : 'white', color: colors.azure600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 300ms cubic-bezier(0.25, 1, 0.5, 1)',
                      }}>
                      <ChevronDown size={15} style={{
                        transform: row.open ? 'rotate(180deg)' : 'none',
                        transition: 'transform 300ms cubic-bezier(0.25, 1, 0.5, 1)',
                      }} />
                    </button>
                    {rows.length > 1 && (
                      <button type="button" title={t('wnew.removeCost')}
                        onClick={() => setRows(prev => prev.filter((_, idx) => idx !== i))}
                        style={{
                          width: 32, height: 32, borderRadius: '50%', border: `1px solid ${colors.red}`,
                          background: colors.redLight, color: colors.red, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'background 300ms cubic-bezier(0.25, 1, 0.5, 1)',
                        }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Monthly distribution (calendaring) */}
                {row.open && (
                  <div className="animate-in" style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${colors.grey100}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: weight.semibold, color: colors.blue800 }}>{t('wnew.monthlyDist')}</span>
                      <button type="button" className="ghost-link" style={{ fontSize: 12 }} onClick={() => redistribute(i)}>
                        {t('wnew.uniform')}
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                      {months.map((m, mi) => (
                        <div key={mi}>
                          <div style={{ fontSize: 10, color: colors.grey800, marginBottom: 2 }}>{m}</div>
                          <input className="input" type="number" min="0" style={{ padding: '6px 8px', fontSize: 12 }}
                            value={row.monthly[mi]} onChange={e => setRowMonth(i, mi, e.target.value)} />
                        </div>
                      ))}
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 12,
                      color: sumOk ? colors.green : colors.red, fontWeight: weight.medium,
                    }}>
                      {sumOk ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                      {t('wnew.monthSum', { sum: formatCurrency(monthSum), budget: formatCurrency(b) })}
                    </div>
                  </div>
                )}
                {errorText(`cost-${i}`)}
              </div>
            );
          })}
        </div>

        {/* Summary + actions */}
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, color: colors.grey800, marginBottom: 2 }}>{t('wnew.totalBudget')}</div>
            <div style={{ fontSize: 22, fontWeight: weight.bold, color: colors.azure500 }}>{formatCurrency(totalBudget)}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/wbs" className="btn-secondary">{t('common.cancel')}</Link>
            {/* Primary CTA: all caps + arrow-in-circle */}
            <button type="submit" className="cta-primary">
              {t('wnew.create')}
              <span className="cta-circle"><ArrowRight size={15} /></span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
