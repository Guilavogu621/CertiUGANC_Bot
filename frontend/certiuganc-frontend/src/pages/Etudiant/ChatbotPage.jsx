import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Chatbot from '../../components/Chatbot/Chatbot';

/**
 * Page wrapper qui affiche le chatbot au centre de l'écran pour les étudiants.
 */
const ChatbotPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col items-center justify-center p-4 relative">
      {/* Retour à l'accueil */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-700 transition-colors font-medium"
      >
        <FaArrowLeft className="text-xs" />
        Retour à l'accueil
      </Link>
      
      <Chatbot />
    </div>
  );
};

export default ChatbotPage;
