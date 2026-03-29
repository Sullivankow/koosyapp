
// Page de gestion des prestations
// Permet à l'admin Koosy de suivre les prestations (ménage, check-in, etc.)
// liées aux biens et aux réservations, et de les assigner aux utilisateurs.
import React, { useState } from 'react';
import Sidebar from '../components/sidebar';
import SearchBar from '../components/searchBar';
import ButtonCreate from '../ui/buttonCreate';
// Import centralisé des types et données mock pour les prestations
import type { Prestation, PrestationType, PrestationStatus } from '../models/mocks';
import { mockPrestations, mockUsers, mockBiensLight } from '../models/mocks';

// Formatage date + heure en français
const formatDateTimeFR = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Badge de couleur selon le type de prestation
const getTypeClasses = (type: PrestationType) => {
  switch (type) {
    case 'Ménage':
      return 'bg-[#ECFDF3] text-[#166534]';
    case 'Check-in':
      return 'bg-[#E0F2FE] text-[#1D4ED8]';
    case 'Check-out':
      return 'bg-[#FEF3C7] text-[#92400E]';
    case 'Linge':
      return 'bg-[#F5F3FF] text-[#6D28D9]';
    case 'Maintenance':
      return 'bg-[#FFE4E6] text-[#BE123C]';
    case 'Autre':
    default:
      return 'bg-[#E5E7EB] text-[#374151]';
  }
};

// Badge de couleur selon le statut
const getStatusClasses = (status: PrestationStatus) => {
  switch (status) {
    case 'Planifiée':
      return 'bg-[#EFF6FF] text-[#1D4ED8]';
    case 'En cours':
      return 'bg-[#FEF3C7] text-[#92400E]';
    case 'Réalisée':
      return 'bg-[#ECFDF3] text-[#166534]';
    case 'Annulée':
      return 'bg-[#FEF2F2] text-[#B91C1C]';
    default:
      return 'bg-[#E5E7EB] text-[#374151]';
  }
};

// Composant principal de la page Prestations
const PrestationsPage: React.FC = () => {
  // État pour la sidebar mobile (ouvert / fermé)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // États pour les filtres
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'Tous' | PrestationType>('Tous');
  const [statusFilter, setStatusFilter] = useState<'Tous' | PrestationStatus>('Tous');
  const [userFilter, setUserFilter] = useState<'Tous' | number>('Tous');
  const [propertyFilter, setPropertyFilter] = useState<'Tous' | number>('Tous');

  // Prestation sélectionnée pour le panneau de détail
  const [selectedPrestation, setSelectedPrestation] = useState<Prestation | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filtrage des prestations (mock)
  const filteredPrestations = mockPrestations.filter((prestation) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      query.length === 0 ||
      prestation.property.name.toLowerCase().includes(query) ||
      prestation.property.city.toLowerCase().includes(query) ||
      (prestation.reservationRef && prestation.reservationRef.toLowerCase().includes(query)) ||
      prestation.type.toLowerCase().includes(query) ||
      (prestation.notes && prestation.notes.toLowerCase().includes(query));

    const matchesType = typeFilter === 'Tous' ? true : prestation.type === typeFilter;
    const matchesStatus = statusFilter === 'Tous' ? true : prestation.status === statusFilter;

    const matchesUser =
      userFilter === 'Tous'
        ? true
        : prestation.assignedTo.id === userFilter || prestation.createdBy.id === userFilter;

    const matchesProperty =
      propertyFilter === 'Tous' ? true : prestation.property.id === propertyFilter;

    return matchesSearch && matchesType && matchesStatus && matchesUser && matchesProperty;
  });

  // Ouvre le drawer
  const openDrawer = (prestation?: Prestation) => {
    setSelectedPrestation(prestation ?? null);
    setDrawerOpen(true);
  };

  // Ferme le drawer
  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedPrestation(null);
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
        <h1 className="text-sm font-semibold text-[#222B45]">Prestations</h1>
        <div className="w-8" />
      </header>

      {/* Contenu principal de la page Prestations */}
      <main className="px-4 py-4 md:ml-60 md:px-6 md:py-6 min-h-screen flex flex-col gap-4">
        {/* En-tête */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#222B45]">Prestations</h2>
            <p className="text-sm text-[#6E7B8B]">
              Ordonnez et suivez les prestations (ménage, check-in, maintenance, etc.) liées aux biens et aux séjours.
            </p>
          </div>
          <ButtonCreate label="Nouvelle prestation" onClick={() => openDrawer()} />
        </div>

        {/* Bloc de filtres */}
        <section className="rounded-2xl bg-white border border-[#E0E6ED] p-4 sm:p-5 space-y-4">
          {/* Recherche globale */}
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Rechercher par bien, ville, type ou réf de réservation…"
          />

          {/* Filtres détaillés */}
          <div className="grid gap-3 sm:grid-cols-4 text-sm">
            {/* Filtre type */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#6E7B8B]">Type de prestation</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="w-full rounded-lg border border-[#E0E6ED] bg-white px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
              >
                <option value="Tous">Tous les types</option>
                <option value="Ménage">Ménage</option>
                <option value="Check-in">Check-in</option>
                <option value="Check-out">Check-out</option>
                <option value="Linge">Linge</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            {/* Filtre statut */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#6E7B8B]">Statut</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full rounded-lg border border-[#E0E6ED] bg-white px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
              >
                <option value="Tous">Tous les statuts</option>
                <option value="Planifiée">Planifiée</option>
                <option value="En cours">En cours</option>
                <option value="Réalisée">Réalisée</option>
                <option value="Annulée">Annulée</option>
              </select>
            </div>

            {/* Filtre bien */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#6E7B8B]">Bien concerné</label>
              <select
                value={propertyFilter}
                onChange={(e) =>
                  setPropertyFilter(e.target.value === 'Tous' ? 'Tous' : Number(e.target.value))
                }
                className="w-full rounded-lg border border-[#E0E6ED] bg-white px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
              >
                <option value="Tous">Tous les biens</option>
                {mockBiensLight.map((bien) => (
                  <option key={bien.id} value={bien.id}>
                    {bien.name} – {bien.city}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre utilisateur Koosy */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#6E7B8B]">Utilisateur assigné</label>
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
              {filteredPrestations.length} prestation
              {filteredPrestations.length > 1 ? 's' : ''} affichée
              {filteredPrestations.length > 1 ? 's' : ''}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setTypeFilter('Tous');
                setStatusFilter('Tous');
                setUserFilter('Tous');
                setPropertyFilter('Tous');
              }}
              className="text-[11px] font-medium text-[#00A896] hover:text-[#00897B]"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </section>

        {/* Liste des prestations sous forme de cartes responsive */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredPrestations.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-[#E0E6ED] bg-[#F9FBFF] p-6 text-center text-sm text-[#6E7B8B]">
              <p className="font-medium mb-1">Aucune prestation ne correspond à vos filtres.</p>
              <p className="text-[12px] text-[#9EABB8] mb-3">
                Essayez de modifier les critères ou d’ajouter une nouvelle prestation.
              </p>
              <button
                type="button"
                onClick={() => openDrawer()}
                className="inline-flex items-center justify-center rounded-lg bg-[#00A896] px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#00897B]"
              >
                Ajouter une prestation
              </button>
            </div>
          ) : (
            filteredPrestations.map((prestation) => (
              <article
                key={prestation.id}
                className="flex flex-col rounded-2xl border border-[#E0E6ED] bg-white shadow-sm overflow-hidden"
              >
                {/* En-tête : type + statut + bien */}
                <div className="p-4 border-b border-[#E0E6ED] bg-gradient-to-r from-[#E0F7F4] via-[#F9FBFF] to-[#E0F2FE] flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-semibold text-[#1F2933] line-clamp-2">
                        {prestation.property.name}
                      </h3>
                      <p className="text-xs text-[#6E7B8B]">
                        {prestation.property.city}, {prestation.property.country}
                      </p>
                      {prestation.reservationRef && (
                        <p className="text-[11px] text-[#0369A1]">
                          Réservation liée · {prestation.reservationRef}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getTypeClasses(prestation.type)}`}
                      >
                        {prestation.type}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusClasses(prestation.status)}`}
                      >
                        {prestation.status}
                      </span>
                    </div>
                  </div>
                  {prestation.notes && (
                    <p className="text-[11px] text-[#6E7B8B] line-clamp-2">{prestation.notes}</p>
                  )}
                </div>

                {/* Corps : planification + utilisateur + prix */}
                <div className="flex-1 p-4 space-y-3 text-xs text-[#6E7B8B]">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[11px] text-[#9EABB8]">Créneau prévu</p>
                      <p className="text-sm font-semibold text-[#1F2933]">
                        {formatDateTimeFR(prestation.scheduledAt)}
                      </p>
                      {prestation.durationMinutes && (
                        <p className="text-[11px] text-[#6E7B8B]">
                          Durée estimée : {prestation.durationMinutes} min
                        </p>
                      )}
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className="text-[11px] text-[#9EABB8]">Coût / Prix</p>
                      {prestation.price ? (
                        <p className="text-sm font-semibold text-[#1F2933]">
                          {prestation.price.toLocaleString('fr-FR')} €
                        </p>
                      ) : (
                        <p className="text-sm text-[#9EABB8]">Non renseigné</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    {/* Utilisateur assigné */}
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-[#0F172A]/5 flex items-center justify-center text-[10px] font-semibold text-[#0F172A]">
                        {prestation.assignedTo.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-medium text-[#1F2933]">{prestation.assignedTo.name}</p>
                        <p className="text-[11px] text-[#6E7B8B]">{prestation.assignedTo.email}</p>
                        <p className="text-[11px] text-[#9EABB8]">Assignée à cet utilisateur</p>
                      </div>
                    </div>

                    {/* Créateur de la prestation */}
                    <div className="text-right space-y-0.5">
                      <p className="text-[11px] text-[#9EABB8]">Créée par</p>
                      <p className="text-xs font-medium text-[#1F2933]">{prestation.createdBy.name}</p>
                      <p className="text-[11px] text-[#6E7B8B]">{prestation.createdBy.email}</p>
                    </div>
                  </div>
                </div>

                {/* Pied de carte : actions mockées */}
                <footer className="flex flex-col gap-2 border-t border-[#E0E6ED] bg-[#F9FBFF] px-4 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openDrawer(prestation)}
                      className="rounded-full border border-transparent px-2 py-0.5 text-[#00A896] hover:bg-[#D1FAF5]"
                    >
                      Voir le détail de la prestation
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-transparent px-2 py-0.5 text-[#9EABB8] hover:bg-[#F4F7FA]"
                    >
                      Marquer comme réalisée (mock)
                    </button>
                  </div>
                  <p className="text-[10px] text-[#9EABB8]">
                    Actions simulées à connecter à ton API Nest (module prestations).
                  </p>
                </footer>
              </article>
            ))
          )}
        </section>
      </main>

      {/* Drawer latéral pour consulter / créer une prestation (mock) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/20" onClick={closeDrawer} />
          <div className="relative ml-auto h-full w-full max-w-md bg-white shadow-xl border-l border-[#E0E6ED] flex flex-col">
            <header className="px-5 py-4 border-b border-[#E0E6ED] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#222B45]">
                  {selectedPrestation ? 'Détail de la prestation' : 'Nouvelle prestation'}
                </h2>
                <p className="text-[11px] text-[#9EABB8]">
                  Formulaire mocké à connecter à ton backend Nest (prestations, biens, réservations, utilisateurs).
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

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm text-[#6E7B8B]">
              {selectedPrestation ? (
                <>
                  <div>
                    <p className="text-xs font-medium text-[#9EABB8] mb-1">Bien</p>
                    <p className="text-sm font-semibold text-[#1F2933]">
                      {selectedPrestation.property.name} – {selectedPrestation.property.city}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-[11px] text-[#9EABB8]">Type</p>
                      <p className="text-sm font-semibold text-[#1F2933]">{selectedPrestation.type}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#9EABB8]">Statut</p>
                      <p className="text-sm font-semibold text-[#1F2933]">{selectedPrestation.status}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#9EABB8]">Créneau prévu</p>
                      <p className="text-sm font-semibold text-[#1F2933]">
                        {formatDateTimeFR(selectedPrestation.scheduledAt)}
                      </p>
                    </div>
                    {selectedPrestation.durationMinutes && (
                      <div>
                        <p className="text-[11px] text-[#9EABB8]">Durée estimée</p>
                        <p className="text-sm font-semibold text-[#1F2933]">
                          {selectedPrestation.durationMinutes} min
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-[11px] text-[#9EABB8]">Prix</p>
                      <p className="text-sm font-semibold text-[#1F2933]">
                        {selectedPrestation.price
                          ? `${selectedPrestation.price.toLocaleString('fr-FR')} €`
                          : 'Non renseigné'}
                      </p>
                    </div>
                  </div>
                  {selectedPrestation.reservationRef && (
                    <div>
                      <p className="text-xs font-medium text-[#9EABB8] mb-1">Réservation liée</p>
                      <p className="text-sm font-semibold text-[#1F2933]">
                        {selectedPrestation.reservationRef}
                      </p>
                    </div>
                  )}
                  {selectedPrestation.notes && (
                    <div>
                      <p className="text-xs font-medium text-[#9EABB8] mb-1">Notes</p>
                      <p className="text-sm text-[#1F2933]">{selectedPrestation.notes}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-[#9EABB8] mb-1">Utilisateur assigné</p>
                    <p className="text-sm font-semibold text-[#1F2933]">{selectedPrestation.assignedTo.name}</p>
                    <p className="text-xs text-[#6E7B8B]">{selectedPrestation.assignedTo.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#9EABB8] mb-1">Créée par</p>
                    <p className="text-sm font-semibold text-[#1F2933]">{selectedPrestation.createdBy.name}</p>
                    <p className="text-xs text-[#6E7B8B]">{selectedPrestation.createdBy.email}</p>
                  </div>
                  <p className="text-[11px] text-[#9EABB8]">
                    Ici tu pourras plus tard modifier le statut, réassigner la prestation à un autre utilisateur,
                    ou ouvrir directement la réservation / le bien associé.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-[#6E7B8B]">
                    Cette vue servira pour la création de prestations :
                    choix du type (ménage, check-in…), sélection du bien et éventuellement de la réservation,
                    date/heure, durée, utilisateur assigné et notes opérationnelles.
                  </p>
                  <ul className="list-disc pl-4 text-[13px] space-y-1">
                    <li>Connecter les champs à ton module prestations côté Nest.</li>
                    <li>Pré-remplir l’utilisateur connecté comme créateur de la prestation.</li>
                    <li>Permettre l’assignation à un autre membre de l’équipe.</li>
                    <li>Relier la prestation à une réservation / un bien pour le suivi.</li>
                  </ul>
                </>
              )}
            </div>

            <footer className="px-5 py-3 border-t border-[#E0E6ED] bg-[#F9FBFF] text-[11px] text-[#9EABB8]">
              Mock UI uniquement – à brancher sur tes endpoints Nest (création / mise à jour de prestation).
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrestationsPage;