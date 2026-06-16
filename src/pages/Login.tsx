import { useState, FormEvent } from 'react';
import { colors, weight } from '../theme';
import { useI18n } from '../i18n';

const DEMO_USER = 'admin';
const DEMO_PASS = 'a2a2026';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const { t } = useI18n();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (username === DEMO_USER && password === DEMO_PASS) {
      localStorage.setItem('a2a-auth', '1');
      onLogin();
    } else {
      setError(true);
    }
  }

  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: colors.blue800,
    }}>
      <div style={{
        background: 'white', borderRadius: 16, padding: '40px 48px',
        width: 380, boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: colors.azure500,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: weight.bold, color: 'white', fontSize: 20,
          }}>R</div>
          <div>
            <div style={{ fontWeight: weight.bold, fontSize: 17, color: colors.blue800, lineHeight: 1.2 }}>Reply</div>
            <div style={{ fontSize: 12, color: colors.grey800 }}>{t('login.title')}</div>
          </div>
        </div>

        <div style={{ fontSize: 14, color: colors.grey800, marginBottom: 24 }}>
          {t('login.subtitle')}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: weight.semibold, color: colors.blue800, marginBottom: 6 }}>
              {t('login.username')}
            </label>
            <input
              className="input"
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(false); }}
              autoComplete="username"
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: weight.semibold, color: colors.blue800, marginBottom: 6 }}>
              {t('login.password')}
            </label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(false); }}
              autoComplete="current-password"
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          {error && (
            <div style={{ fontSize: 12, color: colors.red, marginBottom: 16 }}>
              {t('login.error')}
            </div>
          )}

          <button
            type="submit"
            className="cta-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {t('login.submit')}
            <span className="cta-circle">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        </form>

        <div style={{ marginTop: 20, fontSize: 11, color: colors.grey800, opacity: 0.6, textAlign: 'center' }}>
          Reply — Demo
        </div>
      </div>
    </div>
  );
}
