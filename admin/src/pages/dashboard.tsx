// Page "Tableau de bord" du backoffice
// Affiche un aperçu global de l'activité (stats, abonnements, messages récents...)
import React, { useState } from 'react';
import Sidebar from '../components/sidebar';

const Dashboard: React.FC = () => {
  // État local pour gérer l'ouverture de la sidebar en mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#F4F7FA]">
      {/* Sidebar responsive : visible en permanence sur desktop, coulissante sur mobile */}
      <Sidebar isOpen={sidebarOpen} />

      {/* Overlay mobile : petit voile noir lorsqu'on ouvre le menu, qui permet aussi de le fermer au clic */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Topbar mobile avec bouton burger et titre de la page */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#E0E6ED] bg-[#F4F7FA] md:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="inline-flex items-center justify-center rounded-md border border-[#CBD5E1] bg-white p-2 text-[#0F172A] shadow-sm"
        >
          <span className="sr-only">Ouvrir le menu</span>
          <div className="flex flex-col space-y-1">
            <span className="block h-0.5 w-4 bg-[#0F172A]" />
            <span className="block h-0.5 w-4 bg-[#0F172A]" />
            <span className="block h-0.5 w-4 bg-[#0F172A]" />
          </div>
        </button>
        <h1 className="text-sm font-semibold text-[#222B45]">Tableau de bord</h1>
        {/* Espace réservé pour garder le titre centré visuellement */}
        <div className="w-8" />
      </header>

      {/* Contenu principal de la page */}
      <main className="px-4 py-4 md:ml-60 md:px-6 md:py-6 flex min-h-screen">
        <div className="w-full max-w-6xl mx-auto space-y-6">
          {/* En-tête */}
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-[#222B45]">Tableau de bord</h1>
            <p className="text-sm text-[#6E7B8B]">
              Vue d’ensemble de l’activité Koosy : utilisateurs, abonnements, réservations et santé de
              l’application.
            </p>
          </div>

          {/* Tuiles de stats principales */}
          <div className="grid gap-4 md:grid-cols-4 text-sm">
            <div className="rounded-xl bg-[#F4F7FA] p-4 border border-[#E0E6ED]">
              <p className="text-xs uppercase text-[#6E7B8B] mb-1">Utilisateurs totaux</p>
              <p className="text-2xl font-semibold text-[#222B45]">—</p>
              <p className="text-[11px] text-[#B0BEC5] mt-1">Données à connecter à l’API users</p>
            </div>
            <div className="rounded-xl bg-[#F4F7FA] p-4 border border-[#E0E6ED]">
              <p className="text-xs uppercase text-[#6E7B8B] mb-1">Biens</p>
              <p className="text-2xl font-semibold text-[#222B45]">—</p>
              <p className="text-[11px] text-[#B0BEC5] mt-1">Nombre de biens actifs</p>
            </div>
            <div className="rounded-xl bg-[#F4F7FA] p-4 border border-[#E0E6ED]">
              <p className="text-xs uppercase text-[#6E7B8B] mb-1">Réservations à venir</p>
              <p className="text-2xl font-semibold text-[#222B45]">—</p>
              <p className="text-[11px] text-[#B0BEC5] mt-1">Sur les 7 prochains jours</p>
            </div>
            <div className="rounded-xl bg-[#F4F7FA] p-4 border border-[#E0E6ED]">
              <p className="text-xs uppercase text-[#6E7B8B] mb-1">Tâches à faire</p>
              <p className="text-2xl font-semibold text-[#222B45]">—</p>
              <p className="text-[11px] text-[#B0BEC5] mt-1">Tâches en cours / à venir</p>
            </div>
          </div>

          {/* Abonnements + messages récents */}
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl bg-white border border-[#E0E6ED] p-5 lg:col-span-2">
              <h2 className="text-sm font-semibold text-[#222B45] mb-3">Abonnements</h2>
              <div className="grid gap-3 md:grid-cols-3 text-sm">
                <div className="rounded-xl bg-[#F4F7FA] p-4 border border-[#E0E6ED]">
                  <p className="text-xs uppercase text-[#6E7B8B] mb-1">Total</p>
                  <p className="text-xl font-semibold text-[#222B45]">—</p>
                  <p className="text-[11px] text-[#B0BEC5] mt-1">Tous les comptes</p>
                </div>
                <div className="rounded-xl bg-[#E3F2FD] p-4 border border-[#BBDEFB]">
                  <p className="text-xs uppercase text-[#1976D2] mb-1">Premium</p>
                  <p className="text-xl font-semibold text-[#0D47A1]">—</p>
                  <p className="text-[11px] text-[#1565C0] mt-1">abonnement = 'premium'</p>
                </div>
                <div className="rounded-xl bg-[#F1F8E9] p-4 border border-[#DCEDC8]">
                  <p className="text-xs uppercase text-[#558B2F] mb-1">Gratuit</p>
                  <p className="text-xl font-semibold text-[#33691E]">—</p>
                  <p className="text-[11px] text-[#689F38] mt-1">abonnement = 'gratuit'</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-[#E0E6ED] p-5">
              <h2 className="text-sm font-semibold text-[#222B45] mb-3">Messages récents</h2>
              <ul className="space-y-2 text-sm text-[#6E7B8B]">
                <li className="text-[13px] text-[#B0BEC5]">
                  Aucun message pour le moment.
                  <br />
                  Les derniers retours utilisateurs apparaîtront ici.
                </li>
              </ul>
            </div>
          </div>

          {/* Activité récente */}
          <div className="rounded-2xl bg-white border border-[#E0E6ED] p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#222B45]">Activité récente</h2>
              <span className="text-[11px] text-[#B0BEC5]">Réservations, tâches, prestations…</span>
            </div>
            <div className="rounded-xl border border-dashed border-[#E0E6ED] bg-[#F9FBFF] p-4 text-sm text-[#6E7B8B] text-center">
              Aucune activité mockée pour l’instant.
              <br />
              On pourra ensuite lier cet encart aux dernières réservations, tâches ou prestations.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
