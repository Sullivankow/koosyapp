import React from 'react';
import Sidebar from '../components/sidebar';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-[#F4F7FA]">
      <Sidebar />

      <main className="flex-1 flex items-center justify-center px-6 py-6">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg border border-[#E0E6ED] p-8 text-left">
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
