import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { DateFilterProvider } from './context/DateFilterContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Agents } from './pages/Agents';
import { Customers } from './pages/Customers';
import { Products } from './pages/Products';
import { Accounts } from './pages/Accounts';
import { WhatsAppHub } from './pages/WhatsAppHub';
import { AgentActivities } from './pages/AgentActivities';
import { CalendarManagement } from './pages/CalendarManagement';
import { PerformanceReports } from './pages/PerformanceReports';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { db } from './services/mockDb';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-render-app-name.onrender.com/api'
  : 'http://localhost:5000/api';

db.setBaseUrl(API_BASE_URL);

const ProtectedRoute = ({ children, adminOnly = false }: { children?: React.ReactNode; adminOnly?: boolean }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </Layout>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/customers" element={
        <ProtectedRoute>
          <Customers />
        </ProtectedRoute>
      } />

      <Route path="/whatsapp" element={<Navigate to="/customers" replace />} />

      <Route path="/activities" element={
        <ProtectedRoute>
          <AgentActivities />
        </ProtectedRoute>
      } />

      <Route path="/calendar" element={<Navigate to="/activities" replace />} />

      <Route path="/reports" element={
        <ProtectedRoute>
          <PerformanceReports />
        </ProtectedRoute>
      } />
      
      <Route path="/products" element={
        <ProtectedRoute>
          <Products />
        </ProtectedRoute>
      } />

      <Route path="/agents" element={
        <ProtectedRoute>
          <Agents />
        </ProtectedRoute>
      } />

      <Route path="/accounts" element={
        <ProtectedRoute adminOnly>
          <Accounts />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DateFilterProvider>
        <ChatProvider>
          <HashRouter>
            <AppRoutes />
          </HashRouter>
        </ChatProvider>
      </DateFilterProvider>
    </AuthProvider>
  );
};

export default App;
