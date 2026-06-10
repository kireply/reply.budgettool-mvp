import { createContext, useContext, useState, type ReactNode } from 'react';
import { translations, MONTH_LABELS, LANGUAGES, type Lang } from './translations';

interface I18nContext {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  months: string[];
}

const LanguageContext = createContext<I18nContext | null>(null);

const STORAGE_KEY = 'a2a-budget-tool-lang';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return LANGUAGES.some(l => l.code === stored) ? (stored as Lang) : 'it';
  });

  const setLang = (l: Lang) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
  };

  const t = (key: string, vars?: Record<string, string | number>) => {
    let text = translations[lang][key] ?? translations.it[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, months: MONTH_LABELS[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n(): I18nContext {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useI18n must be used within a LanguageProvider');
  return ctx;
}
