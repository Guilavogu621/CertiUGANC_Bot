import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaSignOutAlt, FaTachometerAlt, FaUsers, FaHome } from 'react-icons/fa';
import logoUganc from '../../assets/logo-ci.png';

/**
 * Composant de mise en page pour les espaces d'administration (Agent et SystemAdmin).
 * Comprend une barre latérale (Sidebar) et un en-tête (Header).
 */
const AdminLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      
      {/* Sidebar (Barre latérale) */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-5 border-b border-gray-100 flex flex-col items-center gap-2">
          <img src={logoUganc} alt="Logo UGANC" className="h-12 w-auto object-contain" />
          <h1 className="text-sm font-bold text-gray-700 tracking-tight">CertiUGANC</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* Liens pour Administrateur */}
          {user?.role === 'ADMIN' && (
            <>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <FaTachometerAlt className="mr-3" />
                Tableau de bord
              </NavLink>
              <NavLink
                to="/admin/etudiants"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <FaUsers className="mr-3" />
                Gestion des Étudiants
              </NavLink>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-2">
          <Link
            to="/"
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <FaHome className="mr-2" />
            Accueil Chatbot
          </Link>
          <button
            onClick={logout}
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <FaSignOutAlt className="mr-2" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Zone de contenu principale */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* En-tête (Header) */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h2 className="text-lg font-semibold text-gray-700">
            Espace Administrateur
          </h2>
          
          <div className="flex items-center">
            <div className="text-right mr-4 hidden md:block">
              <p className="text-sm font-medium text-gray-900">
                {user?.prenom || user?.nom ? `${user?.prenom || ''} ${user?.nom || ''}`.trim() : (user?.username || 'Administrateur Général')}
              </p>
              <p className="text-xs text-gray-500">{user?.role === 'ADMIN' ? 'Administrateur' : 'Agent'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-inner border border-blue-200 uppercase">
              {user?.prenom || user?.nom ? `${(user?.prenom || '').charAt(0)}${(user?.nom || '').charAt(0)}` : (user?.username ? user.username.substring(0, 2) : 'AD')}
            </div>
          </div>
        </header>

        {/* Contenu de la page (les vues enfants seront injectées ici) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f9fafb] p-6">
          <Outlet />
        </main>
      </div>
      
    </div>
  );
};

export default AdminLayout;
