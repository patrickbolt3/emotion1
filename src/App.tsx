import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

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

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
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
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;