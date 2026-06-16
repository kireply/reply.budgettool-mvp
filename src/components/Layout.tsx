import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, ShoppingCart, BarChart3,
  Settings, Bell, User, RotateCcw, Layers
} from 'lucide-react';
import { colors, weight } from '../theme';
import { resetDemoData } from '../data/mockData';
import { useI18n } from '../i18n';
import LanguageSelect from './LanguageSelect';

const navItems = [
  { path: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { path: '/budget-lines', icon: Layers, labelKey: 'nav.budgetLines' },
  { path: '/wbs', icon: FolderKanban, labelKey: 'nav.wbs' },
  { path: '/purchase-requests', icon: ShoppingCart, labelKey: 'nav.pr' },
  { path: '/reportistica', icon: BarChart3, labelKey: 'nav.report' },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { t } = useI18n();

  return (
    // Viewport-fixed shell: only <main> scrolls, sidebar and topbar stay put
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: colors.grey100 }}>
      {/* Sidebar — Blue 800 dark surface per CDL */}
      <aside style={{
        width: 248,
        background: colors.blue800,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: colors.azure500,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: weight.bold, color: 'white', fontSize: 16,
            }}>R</div>
            <div>
              <div style={{ color: 'white', fontWeight: weight.bold, fontSize: 15, lineHeight: 1.2 }}>Reply</div>
              <div style={{ color: '#9CC9E8', fontSize: 11 }}>{t('layout.subtitle')}</div>
            </div>
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{t('layout.year')}</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          <div style={{ marginBottom: 8, fontSize: 11, color: 'rgba(255,255,255,0.45)', padding: '0 16px', fontWeight: weight.medium }}>
            {t('layout.mainMenu')}
          </div>
          {navItems.map(({ path, icon: Icon, labelKey }) => {
            const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none', marginBottom: 4 }}
              >
                <Icon size={16} />
                <span>{t(labelKey)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          <Link to="#" className="sidebar-item" style={{ textDecoration: 'none', marginBottom: 4 }}>
            <Settings size={16} /><span>{t('nav.settings')}</span>
          </Link>
          <button
            className="sidebar-item"
            style={{ width: '100%', border: 'none', background: 'none', marginBottom: 4 }}
            onClick={() => { if (window.confirm(t('layout.resetConfirm'))) resetDemoData(); }}
          >
            <RotateCcw size={16} /><span>{t('layout.resetData')}</span>
          </button>

          {/* Language selector */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', padding: '0 4px', marginBottom: 6, fontWeight: weight.medium }}>
              {t('layout.language')}
            </div>
            <LanguageSelect />
          </div>

          <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.08)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: colors.azure500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={15} color="white" />
            </div>
            <div>
              <div style={{ color: 'white', fontSize: 12, fontWeight: weight.semibold }}>IT Governance</div>
              <div style={{ color: '#9CC9E8', fontSize: 10 }}>Utente demo</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{
          height: 56, flexShrink: 0, background: 'white',
          borderBottom: `1px solid ${colors.grey300}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px',
        }}>
          <div style={{ fontSize: 13, color: colors.grey800 }}>
            {t('layout.topbar')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* 32px touch target per CDL icon rules */}
            <button style={{
              position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
              color: colors.grey800, padding: 8, width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'color 300ms cubic-bezier(0.25, 1, 0.5, 1)',
            }}>
              <Bell size={16} />
            </button>
            <div style={{ height: 24, width: 1, background: colors.grey300 }} />
            <div style={{ fontSize: 13, color: colors.grey800 }}>{t('layout.poweredBy')}</div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
