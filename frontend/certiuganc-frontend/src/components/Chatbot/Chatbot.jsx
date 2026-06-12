import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaRobot, FaUserGraduate } from 'react-icons/fa';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentOptions, isLoading]);

  // Initialisation du chatbot au premier chargement
  useEffect(() => {
    sendMessage(''); // Envoi d'un message vide pour déclencher l'état INIT côté backend
  }, []);

  const sendMessage = async (messageText) => {
    // Si c'est un message de l'utilisateur (non vide), on l'ajoute à l'UI
    if (messageText.trim() !== '') {
      setMessages(prev => [...prev, { text: messageText, isBot: false }]);
    }
    
    setIsLoading(true);
    setCurrentOptions([]); // On cache les options pendant le chargement

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/chatbot/message/', {
        session_id: sessionId,
        message: messageText
      });

      const { session_id, text, options } = response.data;
      
      // Stockage du session_id s'il vient d'être créé
      if (!sessionId) setSessionId(session_id);

      // Ajout de la réponse du bot
      setMessages(prev => [...prev, { text: text, isBot: true }]);
      
      // Affichage des options (boutons) s'il y en a
      if (options && options.length > 0) {
        setCurrentOptions(options);
      }
    } catch (error) {
      console.error('Erreur Chatbot:', error);
      setMessages(prev => [...prev, { 
        text: "Une erreur de connexion est survenue. Le serveur Django tourne-t-il bien ?", 
        isBot: true,
        isError: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    // Si des options de boutons sont affichées, on peut choisir de bloquer la saisie libre,
    // mais ici on autorise les deux pour la flexibilité.
    sendMessage(inputValue);
    setInputValue('');
  };

  const handleOptionClick = (optionValue) => {
    sendMessage(optionValue);
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-md mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100 font-sans">
      {/* En-tête du Chatbot */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white flex items-center shadow-md">
        <div className="bg-white/20 p-2 rounded-full mr-3 backdrop-blur-sm">
          <FaRobot className="text-xl" />
        </div>
        <div>
          <h2 className="font-bold text-lg">CertiUGANC Bot</h2>
          <p className="text-blue-100 text-xs flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
            Assistant Virtuel
          </p>
        </div>
      </div>

      {/* Zone d'affichage des messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
            <div className={`flex max-w-[85%] ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
              
              {/* Avatar Bot ou Utilisateur */}
              <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center shadow-sm ${msg.isBot ? 'bg-indigo-100 text-indigo-600 mr-2' : 'bg-blue-100 text-blue-600 ml-2'}`}>
                {msg.isBot ? <FaRobot size={14} /> : <FaUserGraduate size={14} />}
              </div>

              {/* Bulle de texte */}
              <div className={`p-3 rounded-2xl shadow-sm text-sm ${
                  msg.isBot 
                    ? msg.isError 
                        ? 'bg-red-50 text-red-600 rounded-tl-none border border-red-100' 
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                    : 'bg-blue-600 text-white rounded-tr-none'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
            </div>
          </div>
        ))}
        
        {/* Animation de chargement (typing indicator) */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex space-x-1 items-center h-10 px-4 ml-10">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        {/* Boutons d'options d'action */}
        {!isLoading && currentOptions.length > 0 && (
          <div className="flex flex-col gap-2 mt-2 ml-10 max-w-[80%]">
            {currentOptions.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionClick(opt.value)}
                className="px-4 py-2.5 bg-white hover:bg-indigo-50 text-indigo-700 text-sm font-medium rounded-xl border border-indigo-200 transition-all duration-200 shadow-sm text-left hover:shadow flex justify-between items-center"
              >
                <span>{opt.label}</span>
                <span className="text-indigo-400 text-xs">→</span>
              </button>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Input Form pour saisie texte */}
      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100 flex items-center">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={currentOptions.length > 0 ? "Ou choisissez une option..." : "Écrivez votre message..."}
          className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="ml-2 w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex-shrink-0"
        >
          <FaPaperPlane size={14} className="ml-0.5" />
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
