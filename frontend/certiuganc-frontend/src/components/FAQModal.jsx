import React, { useState } from 'react';
import { FaTimes, FaChevronDown } from 'react-icons/fa';

const faqData = [
  {
    question: "Quels sont les types d'attestations disponibles sur le chatbot ?",
    answer: "Le chatbot délivre uniquement les Attestations d'Inscription pour l'année en cours et les Attestations de Niveau (L1, L2, L3) pour les étudiants du Centre Informatique."
  },
  {
    question: "Quel est le délai de délivrance d'une attestation d'inscription ?",
    answer: "L'attestation d'inscription est générée instantanément en PDF par le chatbot si votre profil est à jour dans notre base de données."
  },
  {
    question: "Quel est le délai pour obtenir une attestation de niveau ?",
    answer: "La demande est envoyée à l'agent administratif pour vérification. La validation prend généralement entre 24h et 48h ouvrées. Une fois validée, le PDF devient téléchargeable."
  },
  {
    question: "Que faire si le chatbot dit que mon matricule n'existe pas ?",
    answer: "Vérifiez que vous avez saisi votre matricule officiel sans espaces. Si le problème persiste, votre compte n'est pas encore enregistré. Contactez le secrétariat de votre département (DLSI ou NTIC)."
  },
  {
    question: "Quelles sont les conditions pour obtenir une Attestation de Niveau ?",
    answer: "Pour demander une attestation de niveau, vous devez avoir validé toutes les matières de l'année concernée. Par exemple, pour l'attestation L2, vous devez avoir validé la L1 ET la L2. Le bot vérifiera ceci automatiquement."
  },
  {
    question: "Les documents PDF générés par le bot sont-ils officiels ?",
    answer: "Oui, chaque attestation PDF comporte l'en-tête officiel de l'UGANC, le logo du Centre Informatique et nécessite la signature physique du Directeur Général après impression."
  },
  {
    question: "Puis-je demander une attestation de niveau si le jury n'a pas encore délibéré ?",
    answer: "Non. Si vos résultats ne sont pas encore officiellement validés dans la base de données, le chatbot bloquera automatiquement votre demande."
  },
  {
    question: "Que faire si les informations affichées par le bot (Nom, Filière, Département) sont incorrectes ?",
    answer: "Ne validez pas la génération du document. Annulez la demande et rendez-vous physiquement au secrétariat de votre département pour faire corriger vos données."
  },
  {
    question: "Les attestations téléchargées ont-elles une date de validité ?",
    answer: "L'attestation d'inscription est valable uniquement pour l'année universitaire en cours. L'attestation de niveau certifie de manière permanente que vous avez validé les unités d'enseignement de l'année concernée."
  }
];

/**
 * Modale FAQ interactive avec accordéons animés en mode clair.
 */
const FAQModal = ({ isOpen, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  if (!isOpen) return null;

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal content */}
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Foire Aux Questions (FAQ)</h2>
            <p className="text-xs text-slate-500 mt-0.5">Scolarité centrale & Portail GTSCO</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Accordions Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {faqData.map((faq, index) => {
            const isActive = activeIndex === index;
            return (
              <div 
                key={index} 
                className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:border-slate-300 transition-colors"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full px-5 py-4 text-left font-semibold text-slate-800 flex justify-between items-center gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <span className="text-sm md:text-base leading-snug">{faq.question}</span>
                  <FaChevronDown 
                    size={14} 
                    className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${isActive ? 'rotate-180 text-blue-600' : ''}`} 
                  />
                </button>

                <div 
                  className={`transition-all duration-200 overflow-hidden ${
                    isActive ? 'max-h-48 border-t border-slate-100' : 'max-h-0'
                  }`}
                >
                  <div className="px-5 py-4 text-sm text-slate-600 bg-slate-50/40 leading-relaxed whitespace-pre-line">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            Fermer la FAQ
          </button>
        </div>

      </div>
    </div>
  );
};

export default FAQModal;
