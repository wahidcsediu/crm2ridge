
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

const ProtectedRoute = ({ children, adminOnly = false }: { children?: React.ReactNode; adminOnly?: boolean }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/customers" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Dashboard wrapper to handle redirects for agents
const DashboardWrapper = () => {
  const { user } = useAuth();
  
  if (user?.role === 'agent') {
    return <Navigate to="/customers" replace />;
  }
  
  return <Dashboard />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardWrapper />
        </ProtectedRoute>
      } />
      
      <Route path="/agents" element={
        <ProtectedRoute adminOnly>
          <Agents />
        </ProtectedRoute>
      } />
      
      <Route path="/customers" element={
        <ProtectedRoute>
          <Customers />
        </ProtectedRoute>
      } />

      <Route path="/products" element={
        <ProtectedRoute>
          <Products />
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
