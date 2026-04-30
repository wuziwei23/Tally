import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';
import TabBar from './components/layout/TabBar';
import HomePage from './pages/HomePage';
import AddTransactionPage from './pages/AddTransactionPage';
import ChartsPage from './pages/ChartsPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

function AppLayout() {
  const location = useLocation();
  const hideTabBar = ['/add'].includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/add" element={<AddTransactionPage />} />
        <Route path="/charts" element={<ChartsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!hideTabBar && <TabBar />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TransactionProvider>
          <AppLayout />
        </TransactionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
