import React from 'react';
import { FaUsers, FaFileAlt, FaClock, FaChartLine } from 'react-icons/fa';

const SystemAdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Administrateur</h1>
        <p className="text-gray-500 mt-1 text-sm">Aperçu global du système et gestion des utilisateurs.</p>
      </div>

      {/* Cartes de statistiques (Valeurs simulées pour l'instant) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Étudiants */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-4 rounded-full bg-blue-50 text-blue-600 mr-4">
            <FaUsers className="text-2xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Étudiants</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>

        {/* Demandes Traitées */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-4 rounded-full bg-green-50 text-green-600 mr-4">
            <FaFileAlt className="text-2xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Demandes Traitées</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>

        {/* Demandes en Attente */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-4 rounded-full bg-amber-50 text-amber-600 mr-4">
            <FaClock className="text-2xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">En Attente</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>

        {/* Taux de réussite (Exemple) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-4 rounded-full bg-purple-50 text-purple-600 mr-4">
            <FaChartLine className="text-2xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Activités</p>
            <p className="text-2xl font-bold text-gray-900">--</p>
          </div>
        </div>

      </div>

      {/* Message Info Fonctionnalité à venir */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-blue-800 mb-2">Gestion des Utilisateurs</h3>
        <p className="text-sm text-blue-700">
          Cet espace est en cours de développement. Prochainement, vous pourrez importer massivement 
          la liste des étudiants inscrits (Licence 1, 2, 3...) via des fichiers Excel fournis par la scolarité centrale.
        </p>
      </div>
    </div>
  );
};

export default SystemAdminDashboard;
