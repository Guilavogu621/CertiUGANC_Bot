import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FaUpload, FaUsers, FaCheck, FaTimes, FaSpinner, FaFileCsv } from 'react-icons/fa';

const StudentsManagement = () => {
  const { authTokens } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);
  
  // Fonction pour récupérer les étudiants
  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/auth/etudiants/', {
        headers: { Authorization: `Bearer ${authTokens.access}` }
      });
      setStudents(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des étudiants", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [authTokens]);

  // Fonction pour gérer l'import CSV
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setUploadMessage(null);

    try {
      const response = await axios.post('http://localhost:8000/api/auth/etudiants/import/', formData, {
        headers: { 
          Authorization: `Bearer ${authTokens.access}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setUploadMessage({ type: 'success', text: `Import réussi : ${response.data.created} créés, ${response.data.updated} mis à jour.` });
      fetchStudents(); // Rafraîchir la liste
    } catch (error) {
      setUploadMessage({ type: 'error', text: error.response?.data?.error || "Erreur lors de l'importation." });
    } finally {
      setUploading(false);
      // Réinitialiser l'input
      e.target.value = null;
    }
  };

  // Fonction pour mettre à jour la validation d'un étudiant
  const handleToggleValidation = async (studentId, field, currentValue) => {
    try {
      // Optimistic update
      setStudents(students.map(s => s.id === studentId ? { ...s, [field]: !currentValue } : s));
      
      await axios.patch(`http://localhost:8000/api/auth/etudiants/${studentId}/`, {
        [field]: !currentValue
      }, {
        headers: { Authorization: `Bearer ${authTokens.access}` }
      });
    } catch (error) {
      console.error("Erreur de mise à jour", error);
      // Revert in case of error
      setStudents(students.map(s => s.id === studentId ? { ...s, [field]: currentValue } : s));
      alert("Erreur lors de la mise à jour.");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FaUsers className="text-blue-600" /> Gestion des Étudiants
          </h1>
          <p className="text-slate-500 mt-1">Importez vos étudiants et gérez leurs validations de niveaux.</p>
        </div>
      </div>

      {/* Zone d'importation */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Importer depuis un fichier CSV</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <label className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 border-dashed rounded-xl cursor-pointer transition-colors w-full sm:w-auto">
            {uploading ? <FaSpinner className="animate-spin" /> : <FaFileCsv size={20} />}
            <span className="font-medium">{uploading ? 'Importation...' : 'Choisir un fichier CSV'}</span>
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>
          <div className="text-sm text-slate-500">
            Colonnes requises : <code className="bg-slate-100 px-1 py-0.5 rounded">numero_etudiant, nom, prenom, genre</code>...
          </div>
        </div>
        {uploadMessage && (
          <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${uploadMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {uploadMessage.text}
          </div>
        )}
      </div>

      {/* Tableau des étudiants */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Matricule</th>
                <th className="p-4 font-semibold">Nom & Prénom</th>
                <th className="p-4 font-semibold text-center">Niveau Actuel</th>
                <th className="p-4 font-semibold text-center">Valide L1</th>
                <th className="p-4 font-semibold text-center">Valide L2</th>
                <th className="p-4 font-semibold text-center">Valide L3</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    <FaSpinner className="animate-spin mx-auto text-blue-500 mb-2" size={24} />
                    Chargement des étudiants...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    Aucun étudiant trouvé. Importez un fichier CSV pour commencer.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded text-slate-700 border border-slate-200">
                        {student.numero_etudiant}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-800">
                      {student.nom} {student.prenom}
                    </td>
                    <td className="p-4 text-center text-sm text-slate-600">
                      {student.niveau || '-'}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleToggleValidation(student.id, 'a_valide_l1', student.a_valide_l1)}
                        className={`w-10 h-6 rounded-full transition-colors relative ${student.a_valide_l1 ? 'bg-green-500' : 'bg-slate-200'}`}
                        title={student.a_valide_l1 ? "Marquer comme non-validé" : "Marquer comme validé"}
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${student.a_valide_l1 ? 'left-5' : 'left-1'}`}></span>
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleToggleValidation(student.id, 'a_valide_l2', student.a_valide_l2)}
                        className={`w-10 h-6 rounded-full transition-colors relative ${student.a_valide_l2 ? 'bg-green-500' : 'bg-slate-200'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${student.a_valide_l2 ? 'left-5' : 'left-1'}`}></span>
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleToggleValidation(student.id, 'a_valide_l3', student.a_valide_l3)}
                        className={`w-10 h-6 rounded-full transition-colors relative ${student.a_valide_l3 ? 'bg-green-500' : 'bg-slate-200'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${student.a_valide_l3 ? 'left-5' : 'left-1'}`}></span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentsManagement;
