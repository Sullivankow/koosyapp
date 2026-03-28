import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-[#E0E6ED]">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#00A896] to-[#00897B] flex items-center justify-center shadow-md mb-3">
            <span className="text-3xl text-white">🔑</span>
          </div>
          <h1 className="text-2xl font-bold text-[#222B45]">Koosy Backoffice</h1>
          <p className="text-sm text-[#6E7B8B] mt-1">Espace d'administration réservé</p>
        </div>

        <form className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#222B45]" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-lg border border-[#E0E6ED] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009688] focus:border-transparent bg-[#F9FBFF]"
              placeholder="vous@koosy.app"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#222B45]" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-lg border border-[#E0E6ED] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009688] focus:border-transparent bg-[#F9FBFF]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="button"
            className="w-full mt-4 bg-[#009688] hover:bg-[#00897B] text-white font-semibold py-2.5 rounded-lg text-sm shadow-sm transition-colors"
            onClick={() => navigate('/dashboard')}
          >
            Se connecter
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#B0BEC5]">
          Utilisation réservée à l'administrateur Koosy pour la gestion<br />
          des comptes et la supervision de l'application.
        </p>
      </div>
    </div>
  );
};

export default Login;