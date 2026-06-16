import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WBSList from './pages/WBSList';
import WBSNew from './pages/WBSNew';
import WBSDetail from './pages/WBSDetail';
import PurchaseRequests from './pages/PurchaseRequests';
import Reportistica from './pages/Reportistica';
import BudgetLines from './pages/BudgetLines';

export default function App() {
  const [authed, setAuthed] = useState(() => localStorage.getItem('a2a-auth') === '1');

  return (
    <LanguageProvider>
      {!authed ? (
        <Login onLogin={() => setAuthed(true)} />
      ) : (
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/budget-lines" element={<BudgetLines />} />
              <Route path="/wbs" element={<WBSList />} />
              <Route path="/wbs/new" element={<WBSNew />} />
              <Route path="/wbs/:id" element={<WBSDetail />} />
              <Route path="/purchase-requests" element={<PurchaseRequests />} />
              <Route path="/purchase-requests/new" element={<PurchaseRequests />} />
              <Route path="/reportistica" element={<Reportistica />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      )}
    </LanguageProvider>
  );
}
