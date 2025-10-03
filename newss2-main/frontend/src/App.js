import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { BlockchainProvider } from './contexts/BlockchainContext';

// Import luxury theme
import luxuryTheme from './theme/luxuryTheme';
import LuxuryLayout from './components/LuxuryLayout';

// Import components
import Login from './pages/Login';
import SimpleDashboard from './pages/SimpleDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProjectCreate from './pages/ProjectCreate';
import Marketplace from './pages/Marketplace';
import CarbonCredits from './pages/CarbonCredits';
import PaymentDistribution from './pages/PaymentDistribution';
import Reports from './pages/Reports';

// Layout wrapper for authenticated routes with luxury design
const AuthenticatedLayout = ({ children, isAdmin = false }) => (
  <LuxuryLayout isAdmin={isAdmin}>
    {children}
  </LuxuryLayout>
);

// Simple protected route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('userInfo') !== null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const location = useLocation();

  // Ensure users start at login page when app loads
  useEffect(() => {
    // If user visits root and is not authenticated, clear any stale data
    if (location.pathname === '/' && !localStorage.getItem('userInfo')) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('userInfo');
    }
  }, [location.pathname]);

  return (
    <ThemeProvider theme={luxuryTheme}>
      <CssBaseline />
      <BlockchainProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected user routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <SimpleDashboard />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <SimpleDashboard />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/user/dashboard" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <SimpleDashboard />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/projects/create" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <ProjectCreate />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/projects" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <SimpleDashboard />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/data-collection" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <SimpleDashboard />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/verification" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <SimpleDashboard />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/marketplace" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Marketplace />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/carbon-credits" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <CarbonCredits />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/payments" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <PaymentDistribution />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/reports" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Reports />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          {/* Admin routes - without luxury layout to keep original design */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BlockchainProvider>
    </ThemeProvider>
  );
}

export default App;
