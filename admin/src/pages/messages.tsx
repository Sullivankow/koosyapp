import React from 'react';
import Sidebar from '../components/sidebar';

const Messages: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-[#F4F7FA]">
      <Sidebar />
      <main className="flex-1 flex items-center justify-center px-6 py-6">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg border border-[#E0E6ED] p-8 text-left">
          <h1 className="text-2xl font-bold text-[#222B45] mb-2">Messages des utilisateurs</h1>
          <p className="text-sm text-[#6E7B8B] mb-6">
            Ici tu pourras lire et gérer les retours que les utilisateurs feront sur
            l'application Koosy (bugs, idées, demandes de support, etc.).
          </p>
          <div className="rounded-xl border border-dashed border-[#E0E6ED] bg-[#F9FBFF] p-6 text-center text-sm text-[#6E7B8B]">
            Aucun message pour le moment.
            <br />
            Plus tard on branchera cet écran sur l'API pour afficher la liste des retours.
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;
