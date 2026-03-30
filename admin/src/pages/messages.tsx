// Page des messages / retours utilisateurs
// Servira plus tard à afficher les feedbacks envoyés depuis l'appli Koosy
import React, { useState } from 'react';
import Sidebar from '../components/sidebar';
import useSidebar from '../hooks/useSidebar';

const Messages: React.FC = () => {
  // État pour l'ouverture de la sidebar en mobile
  const { sidebarOpen, openSidebar, closeSidebar } = useSidebar(false);
  return (
    <div className="min-h-screen bg-[#F4F7FA]">
      {/* Sidebar responsive : fixe sur desktop, ouvrable/fermant en mobile */}
      <Sidebar isOpen={sidebarOpen} />

      {/* Overlay mobile pour fermer la sidebar en cliquant à l'extérieur */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Topbar mobile avec bouton burger et titre de la page */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#E0E6ED] bg-[#F4F7FA] md:hidden">
        <button
          type="button"
          onClick={openSidebar}
          className="inline-flex items-center justify-center rounded-md border border-[#CBD5E1] bg-white p-2 text-[#0F172A] shadow-sm"
        >
          <span className="sr-only">Ouvrir le menu</span>
          <div className="flex flex-col space-y-1">
            <span className="block h-0.5 w-4 bg-[#0F172A]" />
            <span className="block h-0.5 w-4 bg-[#0F172A]" />
            <span className="block h-0.5 w-4 bg-[#0F172A]" />
          </div>
        </button>
        <h1 className="text-sm font-semibold text-[#222B45]">Messages</h1>
        <div className="w-8" />
      </header>

      {/* Contenu principal de la page messages */}
      <main className="px-4 py-4 md:ml-60 md:px-6 md:py-6 min-h-screen flex items-center justify-center">
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
