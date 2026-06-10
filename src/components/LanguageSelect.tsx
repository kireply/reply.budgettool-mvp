import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useI18n } from '../i18n';
import { LANGUAGES } from '../translations';
import Flag from './Flag';

export default function LanguageSelect() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const current = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        className="lang-select"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Flag lang={current.code} />
        <span style={{ flex: 1, textAlign: 'left' }}>{current.label}</span>
        <ChevronDown
          size={14}
          style={{
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 300ms cubic-bezier(0.25, 1, 0.5, 1)',
          }}
        />
      </button>

      {open && (
        <div className="lang-menu" role="listbox" aria-label="Language">
          {LANGUAGES.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              role="option"
              aria-selected={lang === code}
              className={`lang-option ${lang === code ? 'active' : ''}`}
              onClick={() => { setLang(code); setOpen(false); }}
            >
              <Flag lang={code} />
              <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
              {lang === code && <Check size={13} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
