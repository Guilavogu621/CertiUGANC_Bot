import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/Layout/AdminLayout';

// Pages Publiques
import HomePage from './pages/HomePage';
import LoginEtudiant from './pages/Login/LoginEtudiant';
import LoginAgent from './pages/Login/LoginAgent';
import ChatbotPage from './pages/Etudiant/ChatbotPage';

// Pages Administratives
import AgentDashboard from './pages/Agent/Dashboard';
import StudentsManagement from './pages/Agent/StudentsManagement';
import SystemAdminDashboard from './pages/SystemAdmin/Dashboard';

import './index.css';

/**
 * Composant racine de l'application CertiUGANC.
 * Configure le routeur et le contexte d'authentification.
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* --- Routes Publiques --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login/etudiant" element={<LoginEtudiant />} />
          <Route path="/login/agent" element={<LoginAgent />} />
          <Route path="/etudiant/chatbot" element={<ChatbotPage />} />

          {/* --- Routes Protégées : Espace Administrateur --- */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AgentDashboard />} />
              <Route path="/admin/etudiants" element={<StudentsManagement />} />
            </Route>
          </Route>

          {/* Redirection si la page n'existe pas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
