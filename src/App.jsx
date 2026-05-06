import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useHydrated } from './hooks/useBill';
import TabBar from './components/layout/TabBar';
import BudgetBar from './components/home/BudgetBar';
import HomePage from './pages/HomePage';
import AddTransactionPage from './pages/AddTransactionPage';
import ChartsPage from './pages/ChartsPage';
import AnalyticsDetailPage from './pages/AnalyticsDetailPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

function AppLayout() {
  const location = useLocation();
  const hideTabBar = ['/add', '/stats-detail'].includes(location.pathname);
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#F2F2F7',
      }}>
        <div style={{
          textAlign: 'center',
          color: '#8E8E93',
          fontSize: 15,
        }}>
          <div style={{
            width: 36,
            height: 36,
            border: '3px solid #E5E5EA',
            borderTopColor: '#007AFF',
            borderRadius: '50%',
            margin: '0 auto 12px',
            animation: 'spin 0.8s linear infinite',
          }} />
          加载中...
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/add" element={<AddTransactionPage />} />
        <Route path="/charts" element={<ChartsPage />} />
        <Route path="/stats-detail" element={<AnalyticsDetailPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!hideTabBar && (
        <>
          <BudgetBar />
          <TabBar />
        </>
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
