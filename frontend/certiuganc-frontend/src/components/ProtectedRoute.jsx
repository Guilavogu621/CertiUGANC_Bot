import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Composant de protection des routes.
 * Vérifie si l'utilisateur est authentifié et possède le rôle requis.
 * @param {Array} allowedRoles - Liste des rôles autorisés (ex: ['AGENT', 'SYSTEM_ADMIN'])
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Affiche un indicateur de chargement pendant la vérification du token
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Si non connecté ou rôle non autorisé, redirection vers l'accueil
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Si tout est OK, on affiche les composants enfants de la route
  return <Outlet />;
};

export default ProtectedRoute;
