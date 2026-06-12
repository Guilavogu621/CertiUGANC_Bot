import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUserShield, FaLock, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import logoUganc from '../../assets/logo-ci.png';

/**
 * Page de connexion pour les agents administratifs.
 * L'agent se connecte avec son email et son mot de passe.
 */
const LoginAgent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const userData = await login(email, password);
      if (userData.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        setErrorMessage("Ce compte n'a pas les droits Administrateur.");
      }
    } catch {
      setErrorMessage('Email ou mot de passe incorrect.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 flex flex-col items-center justify-center px-4 relative">
      
      {/* Retour à l'accueil */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-700 transition-colors font-medium"
      >
        <FaArrowLeft className="text-xs" />
        Retour à l'accueil
      </Link>

      <div className="w-full max-w-md">
        {/* Logo / En-tête */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={logoUganc} alt="Logo UGANC" className="h-20 w-auto object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Certi<span className="text-emerald-600">UGANC</span>
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm font-medium">Espace Admin</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
              Adresse Email
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@uganc.edu.gn"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-medium">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md shadow-emerald-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-slate-400 text-xs mt-8">
          © 2026 UGANC — Université Gamal Abdel Nasser de Conakry
        </p>
      </div>
    </div>
  );
};

export default LoginAgent;
