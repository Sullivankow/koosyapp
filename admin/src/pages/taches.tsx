
// Page de gestion des tâches
// Permet de suivre les tâches assignées aux utilisateurs Koosy (pour les séjours, prestations, etc.)
import React, { useState } from 'react';
import Sidebar from '../components/sidebar';
// Import centralisé des types et données mock pour les tâches
import type { Tache, TacheStatus, TachePriority } from '../models/mocks';
import { mockTaches, mockUsers } from '../models/mocks';

// Formattage simple de la date en français
const formatDateFR = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Retourne les classes Tailwind selon le statut
const getStatusClasses = (status: TacheStatus) => {
  switch (status) {
    case 'À faire':
      return 'bg-[#FFFBEB] text-[#92400E]';
    case 'En cours':
      return 'bg-[#EFF6FF] text-[#1D4ED8]';
    case 'Terminée':
      return 'bg-[#ECFDF3] text-[#166534]';
    case 'En retard':
      return 'bg-[#FEF2F2] text-[#B91C1C]';
    default:
      return 'bg-[#E5E7EB] text-[#374151]';
  }
};

// Retourne les classes Tailwind selon la priorité
const getPriorityClasses = (priority: TachePriority) => {
  switch (priority) {
    case 'Haute':
      return 'bg-[#FEE2E2] text-[#B91C1C]';
    case 'Moyenne':
      return 'bg-[#FEF3C7] text-[#92400E]';
    case 'Basse':
      return 'bg-[#E0F2FE] text-[#1D4ED8]';
    default:
      return 'bg-[#E5E7EB] text-[#374151]';
  }
};

// Composant principal de la page Tâches
const TachesPage: React.FC = () => {
  // État pour la sidebar mobile (ouvert / fermé)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // États pour les filtres
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tous' | TacheStatus>('Tous');
  const [priorityFilter, setPriorityFilter] = useState<'Toutes' | TachePriority>('Toutes');
  const [userFilter, setUserFilter] = useState<'Tous' | number>('Tous');

  // Tâche sélectionnée pour le panneau de détail
  const [selectedTache, setSelectedTache] = useState<Tache | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filtrage des tâches (mock)
  const filteredTaches = mockTaches.filter((tache) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      query.length === 0 ||
      tache.title.toLowerCase().includes(query) ||
      (tache.description && tache.description.toLowerCase().includes(query)) ||
      (tache.contextRef && tache.contextRef.toLowerCase().includes(query));

    const matchesStatus = statusFilter === 'Tous' ? true : tache.status === statusFilter;
    const matchesPriority = priorityFilter === 'Toutes' ? true : tache.priority === priorityFilter;

    const matchesUser =
      userFilter === 'Tous'
        ? true
        : tache.assignedTo.id === userFilter || tache.createdBy.id === userFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesUser;
  });

  // Ouvre le drawer sur une tâche (ou null pour une future création)
  const openDrawer = (tache?: Tache) => {
    setSelectedTache(tache ?? null);
    setDrawerOpen(true);
  };

  // Ferme le drawer
  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedTache(null);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA]">
      {/* Sidebar responsive : visible sur desktop, coulissante sur mobile */}
      <Sidebar isOpen={sidebarOpen} />

      {/* Overlay mobile pour fermer la sidebar en cliquant à l'extérieur */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Topbar mobile avec bouton burger et titre */}
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
        <h1 className="text-sm font-semibold text-[#222B45]">Tâches</h1>
        <div className="w-8" />
      </header>

      {/* Contenu principal de la page Tâches */}
      <main className="px-4 py-4 md:ml-60 md:px-6 md:py-6 min-h-screen flex flex-col gap-4">
        {/* En-tête */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#222B45]">Tâches</h2>
            <p className="text-sm text-[#6E7B8B]">
              Centralisez les tâches des utilisateurs (check-in, ménage, suivi propriétaire, litiges, etc.).
            </p>
          </div>
          <button
            type="button"
            onClick={() => openDrawer()}
            className="inline-flex items-center justify-center rounded-lg bg-[#00A896] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#00897B] transition-colors"
          >
            <span className="mr-2 text-lg">+</span>
            Nouvelle tâche
          </button>
        </div>

        {/* Bloc de filtres */}
        <section className="rounded-2xl bg-white border border-[#E0E6ED] p-4 sm:p-5 space-y-4">
          {/* Recherche globale */}
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#9EABB8] text-sm">
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par titre, description ou référence liée…"
              className="w-full rounded-lg border border-[#E0E6ED] bg-[#F9FBFF] py-2.5 pl-9 pr-3 text-sm text-[#222B45] placeholder:text-[#9EABB8] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
            />
          </div>

          {/* Filtres détaillés */}
          <div className="grid gap-3 sm:grid-cols-3 text-sm">
            {/* Filtre statut */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#6E7B8B]">Statut</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full rounded-lg border border-[#E0E6ED] bg-white px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
              >
                <option value="Tous">Tous les statuts</option>
                <option value="À faire">À faire</option>
                <option value="En cours">En cours</option>
                <option value="Terminée">Terminée</option>
                <option value="En retard">En retard</option>
              </select>
            </div>

            {/* Filtre priorité */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#6E7B8B]">Priorité</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="w-full rounded-lg border border-[#E0E6ED] bg-white px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
              >
                <option value="Toutes">Toutes les priorités</option>
                <option value="Haute">Haute</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Basse">Basse</option>
              </select>
            </div>

            {/* Filtre utilisateur */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#6E7B8B]">Utilisateur Koosy</label>
              <select
                value={userFilter}
                onChange={(e) =>
                  setUserFilter(e.target.value === 'Tous' ? 'Tous' : Number(e.target.value))
                }
                className="w-full rounded-lg border border-[#E0E6ED] bg-white px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
              >
                <option value="Tous">Tous les utilisateurs</option>
                {mockUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Résumé + reset */}
          <div className="flex flex-col items-start justify-end gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-[#9EABB8]">
              {filteredTaches.length} tâche
              {filteredTaches.length > 1 ? 's' : ''} affichée
              {filteredTaches.length > 1 ? 's' : ''}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('Tous');
                setPriorityFilter('Toutes');
                setUserFilter('Tous');
              }}
              className="text-[11px] font-medium text-[#00A896] hover:text-[#00897B]"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </section>

        {/* Liste des tâches sous forme de cartes (responsive) */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredTaches.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-[#E0E6ED] bg-[#F9FBFF] p-6 text-center text-sm text-[#6E7B8B]">
              <p className="font-medium mb-1">Aucune tâche ne correspond à vos filtres.</p>
              <p className="text-[12px] text-[#9EABB8] mb-3">
                Essayez de modifier les critères ou d’ajouter une nouvelle tâche.
              </p>
              <button
                type="button"
                onClick={() => openDrawer()}
                className="inline-flex items-center justify-center rounded-lg bg-[#00A896] px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#00897B]"
              >
                Ajouter une tâche
              </button>
            </div>
          ) : (
            filteredTaches.map((tache) => (
              <article
                key={tache.id}
                className="flex flex-col rounded-2xl border border-[#E0E6ED] bg-white shadow-sm overflow-hidden"
              >
                {/* En-tête de la carte : titre + statuts */}
                <div className="p-4 border-b border-[#E0E6ED] bg-gradient-to-r from-[#E0F7F4] via-[#F9FBFF] to-[#E0F2FE] flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-[#1F2933] line-clamp-2">
                      {tache.title}
                    </h3>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusClasses(tache.status)}`}
                      >
                        {tache.status}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getPriorityClasses(tache.priority)}`}
                      >
                        Priorité {tache.priority}
                      </span>
                    </div>
                  </div>
                  {tache.description && (
                    <p className="text-[11px] text-[#6E7B8B] line-clamp-2">{tache.description}</p>
                  )}
                  {tache.contextRef && (
                    <p className="text-[11px] text-[#0369A1]">
                      {tache.contextType ?? 'Contexte'} · {tache.contextRef}
                    </p>
                  )}
                </div>

                {/* Corps de carte : dates + utilisateurs */}
                <div className="flex-1 p-4 space-y-3 text-xs text-[#6E7B8B]">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[11px] text-[#9EABB8]">Échéance</p>
                      <p className="text-sm font-semibold text-[#1F2933]">
                        {formatDateFR(tache.dueDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#9EABB8]">Créée le</p>
                      <p className="text-sm font-semibold text-[#1F2933]">
                        {formatDateFR(tache.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    {/* Utilisateur assigné */}
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-[#0F172A]/5 flex items-center justify-center text-[10px] font-semibold text-[#0F172A]">
                        {tache.assignedTo.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-medium text-[#1F2933]">{tache.assignedTo.name}</p>
                        <p className="text-[11px] text-[#6E7B8B]">{tache.assignedTo.email}</p>
                        <p className="text-[11px] text-[#9EABB8]">Assignée à cet utilisateur</p>
                      </div>
                    </div>

                    {/* Créateur de la tâche */}
                    <div className="text-right space-y-0.5">
                      <p className="text-[11px] text-[#9EABB8]">Créée par</p>
                      <p className="text-xs font-medium text-[#1F2933]">{tache.createdBy.name}</p>
                      <p className="text-[11px] text-[#6E7B8B]">{tache.createdBy.email}</p>
                    </div>
                  </div>
                </div>

                {/* Pied de carte : actions mockées */}
                <footer className="flex flex-col gap-2 border-t border-[#E0E6ED] bg-[#F9FBFF] px-4 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openDrawer(tache)}
                      className="rounded-full border border-transparent px-2 py-0.5 text-[#00A896] hover:bg-[#D1FAF5]"
                    >
                      Voir le détail de la tâche
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-transparent px-2 py-0.5 text-[#9EABB8] hover:bg-[#F4F7FA]"
                    >
                      Marquer comme terminée (mock)
                    </button>
                  </div>
                  <p className="text-[10px] text-[#9EABB8]">
                    Actions simulées à connecter à ton API Nest (module tâches / to-do interne).
                  </p>
                </footer>
              </article>
            ))
          )}
        </section>
      </main>

      {/* Drawer latéral pour consulter / créer une tâche (mock) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/20" onClick={closeDrawer} />
          <div className="relative ml-auto h-full w-full max-w-md bg-white shadow-xl border-l border-[#E0E6ED] flex flex-col">
            <header className="px-5 py-4 border-b border-[#E0E6ED] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#222B45]">
                  {selectedTache ? 'Détail de la tâche' : 'Nouvelle tâche'}
                </h2>
                <p className="text-[11px] text-[#9EABB8]">
                  Formulaire mocké à connecter à ton backend Nest (tâches / assignation utilisateurs).
                </p>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-full border border-[#E0E6ED] bg-white px-2 py-1 text-xs text-[#6E7B8B] hover:bg-[#F4F7FA]"
              >
                Fermer
              </button>
            </header>

            {/* Contenu du drawer */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm text-[#6E7B8B]">
              {selectedTache ? (
                <>
                  <div>
                    <p className="text-xs font-medium text-[#9EABB8] mb-1">Titre</p>
                    <p className="text-sm font-semibold text-[#1F2933]">{selectedTache.title}</p>
                  </div>
                  {selectedTache.description && (
                    <div>
                      <p className="text-xs font-medium text-[#9EABB8] mb-1">Description</p>
                      <p className="text-sm text-[#1F2933]">{selectedTache.description}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-[11px] text-[#9EABB8]">Statut</p>
                      <p className="text-sm font-semibold text-[#1F2933]">{selectedTache.status}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#9EABB8]">Priorité</p>
                      <p className="text-sm font-semibold text-[#1F2933]">{selectedTache.priority}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#9EABB8]">Échéance</p>
                      <p className="text-sm font-semibold text-[#1F2933]">{formatDateFR(selectedTache.dueDate)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#9EABB8]">Créée le</p>
                      <p className="text-sm font-semibold text-[#1F2933]">{formatDateFR(selectedTache.createdAt)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#9EABB8] mb-1">Utilisateur assigné</p>
                    <p className="text-sm font-semibold text-[#1F2933]">{selectedTache.assignedTo.name}</p>
                    <p className="text-xs text-[#6E7B8B]">{selectedTache.assignedTo.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#9EABB8] mb-1">Créée par</p>
                    <p className="text-sm font-semibold text-[#1F2933]">{selectedTache.createdBy.name}</p>
                    <p className="text-xs text-[#6E7B8B]">{selectedTache.createdBy.email}</p>
                  </div>
                  {selectedTache.contextRef && (
                    <div>
                      <p className="text-xs font-medium text-[#9EABB8] mb-1">Contexte lié</p>
                      <p className="text-sm font-semibold text-[#1F2933]">
                        {selectedTache.contextType ?? 'Contexte'} · {selectedTache.contextRef}
                      </p>
                    </div>
                  )}
                  <p className="text-[11px] text-[#9EABB8]">
                    Ici tu pourras plus tard modifier le statut, réassigner la tâche, ou créer un lien direct vers la réservation / prestation concernée.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-[#6E7B8B]">
                    Cette vue servira pour la création de tâches internes Koosy :
                    choix de l’utilisateur assigné, description, priorité, échéance et lien éventuel avec une réservation ou une prestation.
                  </p>
                  <ul className="list-disc pl-4 text-[13px] space-y-1">
                    <li>Connecter les champs à ton module de tâches côté Nest.</li>
                    <li>Pré-remplir l’utilisateur connecté comme créateur de la tâche.</li>
                    <li>Permettre l’assignation à un autre membre de l’équipe.</li>
                    <li>Relier la tâche à une réservation / prestation pour le suivi opérationnel.</li>
                  </ul>
                </>
              )}
            </div>

            <footer className="px-5 py-3 border-t border-[#E0E6ED] bg-[#F9FBFF] text-[11px] text-[#9EABB8]">
              Mock UI uniquement – à brancher sur tes endpoints Nest (création / mise à jour de tâche).
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default TachesPage;