import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WBSList from './pages/WBSList';
import WBSNew from './pages/WBSNew';
import WBSDetail from './pages/WBSDetail';
import PurchaseRequests from './pages/PurchaseRequests';
import Reportistica from './pages/Reportistica';

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/wbs" element={<WBSList />} />
          <Route path="/wbs/new" element={<WBSNew />} />
          <Route path="/wbs/:id" element={<WBSDetail />} />
          <Route path="/purchase-requests" element={<PurchaseRequests />} />
          <Route path="/purchase-requests/new" element={<PurchaseRequests />} />
          <Route path="/reportistica" element={<Reportistica />} />
        </Routes>
      </Layout>
      </LanguageProvider>
    </BrowserRouter>
  );
}
