import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaPaperPlane, FaRobot, FaUserGraduate, FaUserShield, FaUniversity, FaQuestionCircle } from 'react-icons/fa';
import FAQModal from '../components/FAQModal';
import logoUganc from '../assets/logo-ci.png';
import logoCI from '../assets/logo-ci.png';

/**
 * Page d'accueil principale affichant directement l'assistant virtuel (Chatbot)
 * en mode clair institutionnel.
 */
const HomePage = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const isInitialized = useRef(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);

  // Auto-scroll vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentOptions, isLoading]);

  // Initialisation du chatbot au premier chargement
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    sendMessage(''); // Envoi d'un message vide pour déclencher l'état d'accueil côté API
  }, []);

  const sendMessage = async (messageText) => {
    // Si c'est un message utilisateur non vide, on l'affiche
    if (messageText.trim() !== '') {
      // Masquer le mot de passe dans l'historique des messages si on est dans l'état ATTENTE_MDP
      const isPassword = messages.length > 0 && messages[messages.length - 1].text.includes('mot de passe');
      const displayText = isPassword ? '••••••••' : messageText;
      setMessages(prev => [...prev, { text: displayText, isBot: false }]);
    }
    
    setIsLoading(true);
    setCurrentOptions([]); // Vider les options pendant la requête

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/chatbot/message/', {
        session_id: sessionId,
        message: messageText
      });

      const { session_id, text, options } = response.data;
      
      if (!sessionId) setSessionId(session_id);

      // Ajouter la réponse du chatbot
      setMessages(prev => [...prev, { text: text, isBot: true }]);
      
      // Mettre à jour les boutons d'options
      if (options && options.length > 0) {
        setCurrentOptions(options);
      }
    } catch (error) {
      console.error('Erreur Chatbot API:', error);
      setMessages(prev => [...prev, { 
        text: "Une erreur de connexion est survenue avec le service de scolarité. Veuillez réessayer plus tard.", 
        isBot: true,
        isError: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    
    sendMessage(inputValue);
    setInputValue('');
  };

  const handleOptionClick = (optionValue) => {
    sendMessage(optionValue);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Bandeau d'en-tête (Header) */}
      <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <img src={logoUganc} alt="Logo UGANC" className="h-10 w-auto object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">CertiUGANC Bot</h1>
              <span className="bg-green-100 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                En ligne
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Université Gamal Abdel Nasser de Conakry
            </p>
          </div>
        </div>

        {/* Boutons d'en-tête droite */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFaqOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-blue-700 hover:bg-slate-50 rounded-xl border border-gray-200 transition-all shadow-sm cursor-pointer"
          >
            <FaQuestionCircle className="text-sm text-blue-700" />
            FAQ & Aide
          </button>
          
          <Link
            to="/login/agent"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-blue-700 hover:bg-slate-50 rounded-xl border border-gray-200 transition-all shadow-sm"
          >
            <FaUserShield className="text-sm text-blue-700" />
            Connexion Admin
          </Link>
        </div>
      </header>

      {/* Zone centrale du Chatbot */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col justify-between overflow-hidden">
        
        {/* Fenêtre de Chat */}
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-md flex flex-col overflow-hidden">
          
          {/* Section d'accueil d'aide */}
          <div className="bg-slate-50 border-b border-gray-100 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
            <span>Discutez avec l'assistant pour générer ou suivre vos demandes.</span>
            <span className="font-semibold text-blue-600">Session Active</span>
          </div>

          {/* Corps de la conversation */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/20">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`flex max-w-[80%] ${msg.isBot ? 'flex-row' : 'flex-row-reverse'} items-start`}>
                  
                  {/* Icone d'avatar */}
                  {msg.isBot ? (
                    <img src={logoCI} alt="Logo CI" className="w-8 h-8 rounded-full border border-gray-200 bg-white p-1 object-contain shadow-sm shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 border border-blue-200 text-indigo-700 ml-3">
                      <FaUserGraduate size={14} />
                    </div>
                  )}

                  {/* Bulle de message */}
                  <div className={`p-4 rounded-2xl shadow-sm text-sm border leading-relaxed ${
                    msg.isBot
                      ? msg.isError 
                        ? 'bg-red-50 text-red-700 border-red-100 rounded-tl-none' 
                        : 'bg-white text-slate-800 border-gray-100 rounded-tl-none'
                      : 'bg-blue-700 text-white border-blue-700 rounded-tr-none'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Indicateur de saisie en cours du Bot */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start">
                  <img 
                    src={logoUganc} 
                    alt="Avatar Bot" 
                    className="w-8 h-8 rounded-full border border-gray-200 bg-white p-1 object-contain shadow-sm mr-3 flex-shrink-0 animate-pulse" 
                  />
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex space-x-1 items-center h-10 px-4">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Boutons d'options d'action dynamiques */}
            {!isLoading && currentOptions.length > 0 && (
              <div className="flex flex-col gap-2 mt-2 ml-12 max-w-[75%]">
                {currentOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(opt.value)}
                    className="px-4 py-3 bg-white hover:bg-blue-50 text-blue-700 text-sm font-semibold rounded-xl border border-blue-200 hover:border-blue-400 transition-all duration-200 shadow-sm text-left flex justify-between items-center group"
                  >
                    <span>{opt.label}</span>
                    <span className="text-blue-400 group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} className="h-1" />
          </div>

          {/* Formulaire de saisie en bas de la fenêtre */}
          <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200 flex items-center gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={currentOptions.length > 0 ? "Veuillez cliquer sur une option ci-dessus..." : "Saisissez votre réponse ici..."}
              className="flex-1 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="w-12 h-12 flex items-center justify-center bg-blue-700 text-white rounded-xl hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex-shrink-0"
            >
              <FaPaperPlane size={15} />
            </button>
          </form>

        </div>
        
        {/* Mentions légales au pied de la discussion */}
        <p className="text-center text-[10px] text-slate-400 mt-3">
          © 2026 UGANC — Université Gamal Abdel Nasser de Conakry • Service de Scolarité Numérique
        </p>
      </main>

      {/* FAQ Modal */}
      <FAQModal isOpen={isFaqOpen} onClose={() => setIsFaqOpen(false)} />
    </div>
  );
};

export default HomePage;
