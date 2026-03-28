import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col">
      <header className="w-full border-b border-[#E0E6ED] bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#00A896] to-[#00897B] flex items-center justify-center shadow-md">
              <span className="text-lg">🔑</span>
            </div>
            <span className="font-semibold text-[#222B45]">Koosy Backoffice</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/dashboard" className="text-[#009688] font-medium">
              Dashboard
            </Link>
            <Link to="/login" className="text-[#6E7B8B] hover:text-[#009688]">
              Déconnexion
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-[#E0E6ED] p-8 text-left">
          <h1 className="text-2xl font-bold text-[#222B45] mb-2">Tableau de bord</h1>
          <p className="text-sm text-[#6E7B8B] mb-6">
            Ici tu pourras bientôt gérer les utilisateurs, surveiller l'état de l'application
            et accéder à toutes les fonctionnalités d'administration Koosy.
          </p>
          <div className="grid gap-4 md:grid-cols-3 text-sm">
            <div className="rounded-xl bg-[#F4F7FA] p-4 border border-[#E0E6ED]">
              <p className="text-xs uppercase text-[#6E7B8B] mb-1">Utilisateurs</p>
              <p className="text-xl font-semibold text-[#222B45]">À venir</p>
            </div>
            <div className="rounded-xl bg-[#F4F7FA] p-4 border border-[#E0E6ED]">
              <p className="text-xs uppercase text-[#6E7B8B] mb-1">Incidents</p>
              <p className="text-xl font-semibold text-[#222B45]">À venir</p>
            </div>
            <div className="rounded-xl bg-[#F4F7FA] p-4 border border-[#E0E6ED]">
              <p className="text-xs uppercase text-[#6E7B8B] mb-1">Logs</p>
              <p className="text-xl font-semibold text-[#222B45]">À venir</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
