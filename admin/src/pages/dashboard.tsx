import React from 'react';
import Sidebar from '../components/sidebar';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-[#F4F7FA]">
      <Sidebar />

      <main className="flex-1 px-6 py-6 flex">
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
