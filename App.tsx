
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import BackendWakeUp from './components/BackendWakeup';
import AuthPage from './components/AuthPage';
import ChatPage from './components/ChatPage';
import EmailConfirmationPage from './components/EmailConfirmationPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="check-email" element={<EmailConfirmationPage />} />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
                <ChatPage />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/chat/:conversationId"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/chat" : "/auth"} />} 
        />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <BackendWakeUp maxWaitSeconds={45}>
          <AppRoutes />
        </BackendWakeUp>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
