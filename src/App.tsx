import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { AdminLayout, AdminPage } from './components/admin/AdminLayout';
import { AdminLogin } from './pages/AdminLogin';
import { CashierLogin } from './pages/CashierLogin';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { CashierManagement } from './pages/CashierManagement';
import { CashierView } from './pages/CashierView';

/**
 * App Mode - determines which view to show
 */
type AppMode = 'cashier' | 'admin';

/**
 * Main App Component
 * Wraps the application with AuthProvider
 */
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

/**
 * App Content Component
 * Handles routing between Cashier and Admin modes
 */
function AppContent() {
  const { isAuthenticated } = useAuth();
  const [appMode, setAppMode] = useState<AppMode>('cashier');
  const [adminPage, setAdminPage] = useState<AdminPage>('dashboard');
  const [cashierName, setCashierName] = useState<string>('');

  // Switch to admin mode
  const handleSwitchToAdmin = () => {
    setAppMode('admin');
  };

  // Handle cashier login
  const handleCashierLogin = (name: string) => {
    setCashierName(name);
  };

  // Handle cashier logout
  const handleCashierLogout = () => {
    setCashierName('');
  };

  // Render admin page content
  const renderAdminPage = () => {
    switch (adminPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products />;
      case 'cashiers':
        return <CashierManagement />;
      default:
        return <Dashboard />;
    }
  };

  // If in admin mode
  if (appMode === 'admin') {
    // If not authenticated, show admin login
    if (!isAuthenticated) {
      return <AdminLogin />;
    }
    // Admin is authenticated, show admin layout
    return (
      <ProtectedRoute>
        <AdminLayout currentPage={adminPage} onPageChange={setAdminPage}>
          {renderAdminPage()}
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  // In cashier mode
  // If cashier not logged in, show cashier login
  if (!cashierName) {
    return (
      <CashierLogin
        onLogin={handleCashierLogin}
        onSwitchToAdmin={handleSwitchToAdmin}
      />
    );
  }

  // Cashier is logged in, show cashier view
  return (
    <CashierView
      cashierName={cashierName}
      onLogout={handleCashierLogout}
      onSwitchToAdmin={handleSwitchToAdmin}
    />
  );
}

export default App;
