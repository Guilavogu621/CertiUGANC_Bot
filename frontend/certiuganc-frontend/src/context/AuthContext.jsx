import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import apiClient from '../services/api';

const AuthContext = createContext(null);

/**
 * Fournisseur du contexte d'authentification.
 * Gère le token JWT, les infos utilisateur et la déconnexion.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          id: decoded.user_id,
          role: decoded.role,
          nom: decoded.nom,
          prenom: decoded.prenom,
          matricule: decoded.matricule || null,
        });
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    setIsLoading(false);
  }, []);

  /**
   * Connexion : envoie les identifiants au backend, stocke les tokens et décode le payload.
   */
  const login = async (username, password) => {
    const response = await apiClient.post('/auth/login/', { username, password });
    const { access, refresh } = response.data;

    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    const decoded = jwtDecode(access);
    const userData = {
      id: decoded.user_id,
      role: decoded.role,
      nom: decoded.nom,
      prenom: decoded.prenom,
      matricule: decoded.matricule || null,
    };
    setUser(userData);
    return userData;
  };

  /**
   * Déconnexion : supprime les tokens et réinitialise l'état.
   */
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personnalisé pour accéder au contexte d'authentification.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};
