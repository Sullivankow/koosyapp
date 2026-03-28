
// Page de gestion des réservations
// Permet à l'équipe de suivre les séjours par bien, voyageur et utilisateur Koosy
import React, { useState } from 'react';
import Sidebar from '../components/sidebar';
// Import centralisé des types et données mock pour les réservations
import type { Reservation, ReservationStatus } from '../models/mocks';
import { mockReservations, mockUsers, mockBiensLight } from '../models/mocks';

// Petite fonction utilitaire pour formater les dates en français
const formatDateFR = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Composant principal de la page Réservations
const ReservationsPage: React.FC = () => {
  // État pour la sidebar mobile (ouvert / fermé)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // États pour les filtres
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tous' | ReservationStatus>('Tous');
  const [userFilter, setUserFilter] = useState<'Tous' | number>('Tous');
  const [propertyFilter, setPropertyFilter] = useState<'Tous' | number>('Tous');

  // Réservation sélectionnée (pour le panneau de détail / création)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filtrage des réservations (mock)
  const filteredReservations = mockReservations.filter((reservation) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      query.length === 0 ||
      reservation.reference.toLowerCase().includes(query) ||
      reservation.property.name.toLowerCase().includes(query) ||
      reservation.property.city.toLowerCase().includes(query) ||
      reservation.traveler.name.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === 'Tous' ? true : reservation.status === statusFilter;

    const matchesUser =
      userFilter === 'Tous'
        ? true
        : reservation.assignedTo?.id === userFilter || reservation.createdBy.id === userFilter;

    const matchesProperty =
      propertyFilter === 'Tous' ? true : reservation.property.id === propertyFilter;

    return matchesSearch && matchesStatus && matchesUser && matchesProperty;
  });

  // Ouvre le drawer pour créer ou afficher une réservation
  const openDrawer = (reservation?: Reservation) => {
    setSelectedReservation(reservation ?? null);
    setDrawerOpen(true);
  };

  // Ferme le drawer
  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedReservation(null);
  };

  // Badge de couleur selon le statut
  const getStatusClasses = (status: ReservationStatus) => {
    switch (status) {
      case 'Confirmée':
        return 'bg-[#ECFDF3] text-[#166534]';
      case 'En cours':
        return 'bg-[#EFF6FF] text-[#1D4ED8]';
      case 'Terminée':
        return 'bg-[#F1F5F9] text-[#0F172A]';
      case 'Annulée':
        return 'bg-[#FEF2F2] text-[#B91C1C]';
      case 'Brouillon':
      default:
        return 'bg-[#FFFBEB] text-[#92400E]';
    }
  };

  // Texte d'aide sous le badge
  const getStatusHelper = (status: ReservationStatus) => {
    switch (status) {
      case 'Confirmée':
        return 'Séjour validé, prêt à être planifié (prestations, équipes).';
      case 'En cours':
        return 'Séjour en cours, pensez au suivi des prestations terrain.';
      case 'Terminée':
        return 'Séjour terminé, utile pour le reporting et l’historique.';
      case 'Annulée':
        return 'Réservation annulée, conservée pour traçabilité backoffice.';
      case 'Brouillon':
      default:
        return 'Brouillon créé par un utilisateur Koosy, pas encore confirmé.';
    }
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
        <h1 className="text-sm font-semibold text-[#222B45]">Réservations</h1>
        <div className="w-8" />
      </header>

      {/* Contenu principal de la page Réservations */}
      <main className="px-4 py-4 md:ml-60 md:px-6 md:py-6 min-h-screen flex flex-col gap-4">
        {/* En-tête */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#222B45]">Réservations</h2>
            <p className="text-sm text-[#6E7B8B]">
              Suivez les séjours par bien, voyageur et utilisateur Koosy, et liez-les aux prestations.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openDrawer()}
            className="inline-flex items-center justify-center rounded-lg bg-[#00A896] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#00897B] transition-colors"
          >
            <span className="mr-2 text-lg">+</span>
            Nouvelle réservation
          </button>
        </div>

        {/* Bloc de filtres (recherche + selects) */}
        <section className="rounded-2xl bg-white border border-[#E0E6ED] p-4 sm:p-5 space-y-4">
          {/* Barre de recherche globale */}
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#9EABB8] text-sm">
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par réf, bien ou voyageur…"
              className="w-full rounded-lg border border-[#E0E6ED] bg-[#F9FBFF] py-2.5 pl-9 pr-3 text-sm text-[#222B45] placeholder:text-[#9EABB8] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
            />
          </div>

          {/* Ligne de filtres détaillés */}
          <div className="grid gap-3 sm:grid-cols-3 text-sm">
            {/* Filtre statut */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#6E7B8B]">Statut de la réservation</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full rounded-lg border border-[#E0E6ED] bg-white px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
              >
                <option value="Tous">Tous les statuts</option>
                <option value="Brouillon">Brouillon</option>
                <option value="Confirmée">Confirmée</option>
                <option value="En cours">En cours</option>
                <option value="Terminée">Terminée</option>
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
              <label className="block text-xs font-medium text-[#6E7B8B]">Utilisateur Koosy concerné</label>
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

          {/* Résumé + bouton de réinitialisation */}
          <div className="flex flex-col items-start justify-end gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-[#9EABB8]">
              {filteredReservations.length} réservation
              {filteredReservations.length > 1 ? 's' : ''} affichée
              {filteredReservations.length > 1 ? 's' : ''}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
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

        {/* Liste des réservations sous forme de cartes responsive */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredReservations.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-[#E0E6ED] bg-[#F9FBFF] p-6 text-center text-sm text-[#6E7B8B]">
              <p className="font-medium mb-1">Aucune réservation ne correspond à vos filtres.</p>
              <p className="text-[12px] text-[#9EABB8] mb-3">
                Essayez de modifier les critères ou d’ajouter une nouvelle réservation.
              </p>
              <button
                type="button"
                onClick={() => openDrawer()}
                className="inline-flex items-center justify-center rounded-lg bg-[#00A896] px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#00897B]"
              >
                Ajouter une réservation
              </button>
            </div>
          ) : (
            filteredReservations.map((reservation) => (
              <article
                key={reservation.id}
                className="flex flex-col rounded-2xl border border-[#E0E6ED] bg-white shadow-sm overflow-hidden"
              >
                {/* Bandeau supérieur avec bien + statut */}
                <div className="p-4 border-b border-[#E0E6ED] bg-gradient-to-r from-[#E0F7F4] via-[#F9FBFF] to-[#E0F2FE] flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-semibold text-[#1F2933] line-clamp-2">
                        {reservation.property.name}
                      </h3>
                      <p className="text-xs text-[#6E7B8B]">
                        {reservation.property.city}, {reservation.property.country}
                      </p>
                      <p className="text-[11px] text-[#9EABB8]">
                        Réf. {reservation.reference}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusClasses(reservation.status)}`}
                      >
                        {reservation.status}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-medium text-[#0369A1] border border-[#E0E6ED]">
                        {reservation.channel}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#6E7B8B]">
                    {getStatusHelper(reservation.status)}
                  </p>
                </div>

                {/* Corps de la carte : voyageur + dates + montants */}
                <div className="flex-1 p-4 space-y-3 text-xs text-[#6E7B8B]">
                  {/* Voyageur */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-[#0F172A]/5 flex items-center justify-center text-[10px] font-semibold text-[#0F172A]">
                        {reservation.traveler.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-medium text-[#1F2933]">
                          {reservation.traveler.name}
                        </p>
                        <p className="text-[11px] text-[#6E7B8B]">
                          {reservation.traveler.email}
                        </p>
                        <p className="text-[11px] text-[#6E7B8B]">
                          {reservation.traveler.phone}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className="text-[11px] text-[#9EABB8]">Séjour</p>
                      <p className="text-xs font-medium text-[#1F2933]">
                        {formatDateFR(reservation.checkIn)} → {formatDateFR(reservation.checkOut)}
                      </p>
                      <p className="text-[11px] text-[#6E7B8B]">{reservation.nights} nuit(s)</p>
                    </div>
                  </div>

                  {/* Ligne montants + utilisateur Koosy concerné */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-0.5">
                      <p className="text-[11px] text-[#9EABB8]">Montant total</p>
                      <p className="text-sm font-semibold text-[#1F2933]">
                        {reservation.totalAmount.toLocaleString('fr-FR')} €
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[11px] text-[#9EABB8]">Utilisateur Koosy concerné</p>
                      <p className="text-xs font-medium text-[#1F2933]">
                        {reservation.assignedTo?.name ?? reservation.createdBy.name}
                      </p>
                      <p className="text-[11px] text-[#6E7B8B]">
                        {reservation.assignedTo
                          ? `Assignée à ${reservation.assignedTo.name}, créée par ${reservation.createdBy.name}`
                          : `Créée par ${reservation.createdBy.name}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pied de carte : actions backoffice (mock) */}
                <footer className="flex flex-col gap-2 border-t border-[#E0E6ED] bg-[#F9FBFF] px-4 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openDrawer(reservation)}
                      className="rounded-full border border-transparent px-2 py-0.5 text-[#00A896] hover:bg-[#D1FAF5]"
                    >
                      Voir le détail de la réservation
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-transparent px-2 py-0.5 text-[#9EABB8] hover:bg-[#F4F7FA]"
                    >
                      Ajouter une prestation (mock)
                    </button>
                  </div>
                  <p className="text-[10px] text-[#9EABB8]">
                    Actions simulées à connecter à ton API Nest (réservations + prestations).
                  </p>
                </footer>
              </article>
            ))
          )}
        </section>
      </main>

      {/* Drawer latéral pour créer / consulter une réservation (mock) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/20" onClick={closeDrawer} />
          <div className="relative ml-auto h-full w-full max-w-md bg-white shadow-xl border-l border-[#E0E6ED] flex flex-col">
            <header className="px-5 py-4 border-b border-[#E0E6ED] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#222B45]">
                  {selectedReservation ? 'Détail de la réservation' : 'Nouvelle réservation'}
                </h2>
                <p className="text-[11px] text-[#9EABB8]">
                  Formulaire mocké à connecter à ton backend Nest (biens, voyageurs, utilisateurs).
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

            {/* Contenu du drawer : résumé simple en attendant la vraie intégration */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm text-[#6E7B8B]">
              {selectedReservation ? (
                <>
                  <div>
                    <p className="text-xs font-medium text-[#9EABB8] mb-1">Référence</p>
                    <p className="text-sm font-semibold text-[#1F2933]">
                      {selectedReservation.reference}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#9EABB8] mb-1">Bien</p>
                    <p className="text-sm font-semibold text-[#1F2933]">
                      {selectedReservation.property.name} – {selectedReservation.property.city}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#9EABB8] mb-1">Voyageur</p>
                    <p className="text-sm font-semibold text-[#1F2933]">
                      {selectedReservation.traveler.name}
                    </p>
                    <p className="text-xs text-[#6E7B8B]">{selectedReservation.traveler.email}</p>
                    <p className="text-xs text-[#6E7B8B]">{selectedReservation.traveler.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#9EABB8] mb-1">Séjour</p>
                    <p className="text-sm font-semibold text-[#1F2933]">
                      {formatDateFR(selectedReservation.checkIn)} → {formatDateFR(selectedReservation.checkOut)}
                      {' · '} {selectedReservation.nights} nuit(s)
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#9EABB8] mb-1">Montant</p>
                    <p className="text-sm font-semibold text-[#1F2933]">
                      {selectedReservation.totalAmount.toLocaleString('fr-FR')} € TTC
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#9EABB8] mb-1">Utilisateur Koosy</p>
                    <p className="text-sm font-semibold text-[#1F2933]">
                      {selectedReservation.assignedTo?.name ?? selectedReservation.createdBy.name}
                    </p>
                    <p className="text-xs text-[#6E7B8B]">
                      {selectedReservation.assignedTo
                        ? `Assignée à ${selectedReservation.assignedTo.name}, créée par ${selectedReservation.createdBy.name}`
                        : `Créée par ${selectedReservation.createdBy.name}`}
                    </p>
                  </div>
                  <p className="text-[11px] text-[#9EABB8]">
                    Ici tu pourras plus tard éditer la réservation, changer le statut ou ajouter des prestations liées.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-[#6E7B8B]">
                    Cette vue sert d’exemple pour structurer ta future création de réservation :
                    sélection du bien, du voyageur, des dates, du statut et de l’utilisateur Koosy concerné.
                  </p>
                  <ul className="list-disc pl-4 text-[13px] space-y-1">
                    <li>Connecter les champs au module réservations de ton API Nest.</li>
                    <li>Pré-remplir automatiquement l’utilisateur connecté côté admin (createdBy).</li>
                    <li>Permettre l’assignation à un autre utilisateur Koosy (assignedTo).</li>
                    <li>Lier ensuite cette réservation aux prestations (check-in, ménage, etc.).</li>
                  </ul>
                </>
              )}
            </div>

            <footer className="px-5 py-3 border-t border-[#E0E6ED] bg-[#F9FBFF] text-[11px] text-[#9EABB8]">
              Mock UI uniquement – à brancher sur tes endpoints Nest (création / mise à jour de réservation).
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsPage;