import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Assessment from './pages/Assessment';
import Results from './pages/Results';
import ResultsMockup from './pages/ResultsMockup';
import QuestionsPreview from './pages/QuestionsPreview';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import EmotionalStatesPage from './pages/EmotionalStatesPage';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

// Component to handle automatic redirects for logged in users
const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();
  
  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If user is logged in and tries to access public routes, redirect to dashboard
  const shouldRedirectToDashboard = (path: string) => {
    const publicRoutes = ['/', '/login', '/register', '/results-preview', '/questions-preview', '/emotional-states'];
    return user && publicRoutes.includes(path);
  };
  
  return (
    <Routes>
      {/* Public routes with conditional redirect */}
      <Route 
        path="/" 
        element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} 
      />
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/dashboard" replace /> : <Register />} 
      />
      <Route path="/assessment/:id" element={<Assessment />} />
      <Route path="/results-preview" element={<ResultsMockup />} />
      <Route path="/questions-preview" element={<QuestionsPreview />} />
      <Route path="/emotional-states" element={<EmotionalStatesPage />} />
      
      {/* Protected routes */}
      <Route 
        path="/results/:id" 
        element={
          <ProtectedRoute>
            <Results />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/*" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch all */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;