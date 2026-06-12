import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import { FaSearch, FaCheck, FaTimes, FaFilter, FaSpinner } from 'react-icons/fa';

const AgentDashboard = () => {
  const [demandesRaw, setDemandesRaw] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // États pour les filtres
  const [searchMatricule, setSearchMatricule] = useState('');
  const [statusFilter, setStatusFilter] = useState('EN_ATTENTE');

  // État pour la modale de rejet
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [demandeToReject, setDemandeToReject] = useState(null);
  const [rejectComment, setRejectComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les données au montage
  useEffect(() => {
    fetchDemandes();
  }, []);

  const fetchDemandes = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/attestations/demandes/');
      setDemandesRaw(response.data);
      setError(null);
    } catch (err) {
      setError("Erreur lors de la récupération des demandes.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Logique de filtrage côté client
  const filteredDemandes = demandesRaw.filter((demande) => {
    // 1. Filtrer par statut
    const matchStatus = statusFilter === 'TOUTES' || demande.statut === statusFilter;
    
    // 2. Filtrer par matricule (recherche en temps réel)
    const matchMatricule = demande.etudiant_details?.numero_etudiant
      .toLowerCase()
      .includes(searchMatricule.toLowerCase());

    return matchStatus && matchMatricule;
  });

  // Action : Valider
  const handleValidate = async (id) => {
    if (!window.confirm("Confirmer la validation de cette demande ?")) return;
    
    try {
      await apiClient.post(`/attestations/demandes/${id}/valider/`);
      // Recharger les données pour rafraîchir le tableau
      fetchDemandes();
    } catch (err) {
      alert("Erreur lors de la validation.");
    }
  };

  // Action : Ouvrir modale de rejet
  const handleOpenReject = (demande) => {
    setDemandeToReject(demande);
    setRejectComment('');
    setRejectModalOpen(true);
  };

  // Action : Confirmer le rejet
  const confirmReject = async (e) => {
    e.preventDefault();
    if (!rejectComment.trim()) return;

    setIsSubmitting(true);
    try {
      await apiClient.post(`/attestations/demandes/${demandeToReject.id}/rejeter/`, {
        commentaire: rejectComment
      });
      setRejectModalOpen(false);
      fetchDemandes();
    } catch (err) {
      alert("Erreur lors du rejet de la demande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour obtenir la couleur du badge de statut
  const getStatusBadge = (statut, statutDisplay) => {
    let colorClass = "bg-gray-100 text-gray-800 border-gray-200"; // Défaut
    if (statut === 'EN_ATTENTE') colorClass = "bg-amber-100 text-amber-800 border-amber-200";
    if (statut === 'VALIDEE') colorClass = "bg-green-100 text-green-800 border-green-200";
    if (statut === 'REJETEE') colorClass = "bg-red-100 text-red-800 border-red-200";

    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${colorClass}`}>
        {statutDisplay}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Demandes</h1>
          <p className="text-gray-500 mt-1 text-sm">Consultez et traitez les demandes d'attestations des étudiants.</p>
        </div>
        <button onClick={fetchDemandes} className="mt-4 sm:mt-0 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition">
          Rafraîchir
        </button>
      </div>

      {/* Zone de filtres */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher par Matricule..."
            value={searchMatricule}
            onChange={(e) => setSearchMatricule(e.target.value)}
            className="pl-10 w-full rounded-lg border-gray-200 bg-gray-50 border p-2.5 text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <FaFilter className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          >
            <option value="TOUTES">Toutes les demandes</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="VALIDEE">Validées</option>
            <option value="REJETEE">Rejetées</option>
          </select>
        </div>
      </div>

      {/* Tableau des données */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center items-center text-blue-600">
            <FaSpinner className="animate-spin text-4xl" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : filteredDemandes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Aucune demande trouvée pour ces filtres.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matricule / Étudiant</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type de Document</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Demande</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDemandes.map((demande) => (
                  <tr key={demande.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{demande.etudiant_details?.numero_etudiant}</div>
                      <div className="text-sm text-gray-500">{demande.etudiant_details?.prenom} {demande.etudiant_details?.nom}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">{demande.type_details?.libelle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(demande.date_demande).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(demande.statut, demande.statut_display)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      {demande.statut === 'EN_ATTENTE' ? (
                        <div className="flex items-center justify-center space-x-3">
                          <button
                            onClick={() => handleValidate(demande.id)}
                            className="text-green-600 hover:text-white hover:bg-green-600 bg-green-50 p-2 rounded-lg transition-colors border border-green-200 hover:border-transparent flex items-center shadow-sm"
                            title="Valider la demande"
                          >
                            <FaCheck className="mr-1" /> Valider
                          </button>
                          <button
                            onClick={() => handleOpenReject(demande)}
                            className="text-red-600 hover:text-white hover:bg-red-600 bg-red-50 p-2 rounded-lg transition-colors border border-red-200 hover:border-transparent flex items-center shadow-sm"
                            title="Rejeter la demande"
                          >
                            <FaTimes className="mr-1" /> Rejeter
                          </button>
                        </div>
                      ) : demande.statut === 'VALIDEE' && demande.document?.chemin_fichier ? (
                        <a
                          href={`http://localhost:8000${demande.document.chemin_fichier}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-blue-200 hover:border-transparent flex items-center justify-center shadow-sm text-xs font-medium w-full"
                          title="Télécharger l'attestation PDF"
                        >
                          Télécharger PDF
                        </a>
                      ) : demande.statut === 'REJETEE' ? (
                        <span className="text-red-400 italic text-xs">Rejetée</span>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Traitée</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modale de Rejet */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 transform transition-all">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Rejeter la demande</h3>
            <p className="text-sm text-gray-500 mb-4">
              Veuillez saisir le motif du rejet pour l'étudiant <strong>{demandeToReject?.etudiant_details?.numero_etudiant}</strong>.
            </p>
            
            <form onSubmit={confirmReject}>
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="Ex: Moyenne insuffisante, ou document manquant..."
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-red-500 focus:border-red-500 mb-4 h-32 resize-none"
                required
              />
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !rejectComment.trim()}
                  className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition shadow-md disabled:opacity-50 flex items-center"
                >
                  {isSubmitting ? <FaSpinner className="animate-spin mr-2" /> : <FaTimes className="mr-2" />}
                  Confirmer le rejet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;
