import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GlobalDataProvider } from './context/GlobalDataContext';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProductList = lazy(() => import('./pages/ProductList'));
const ImportPage = lazy(() => import('./pages/ImportPage'));
const ExportPage = lazy(() => import('./pages/ExportPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));

const PageLoader = () => (
  <div className="page-loader">
    <div className="spinner"></div>
    <p>Đang tải trang...</p>
  </div>
);

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <PageLoader />;
  if (!user && !localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }
  return <MainLayout>{children}</MainLayout>;
};

const App = () => {
  return (
    <AuthProvider>
      <GlobalDataProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/products" element={<PrivateRoute><ProductList /></PrivateRoute>} />
              <Route path="/import" element={<PrivateRoute><ImportPage /></PrivateRoute>} />
              <Route path="/export" element={<PrivateRoute><ExportPage /></PrivateRoute>} />
              <Route path="/users" element={<PrivateRoute><UsersPage /></PrivateRoute>} />
              <Route path="/reports" element={<PrivateRoute><ReportsPage /></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
            </Routes>
          </Suspense>
        </Router>
      </GlobalDataProvider>
    </AuthProvider>
  );
};

export default App;