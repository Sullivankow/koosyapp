// Page de gestion des réservations
// Branchée sur le backend Nest pour afficher les vraies réservations
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/sidebar';
import SelectField from '../ui/selectField';
import ButtonCreate from '../ui/buttonCreate';
import FiltersSection from '../components/filters/filtersSection';
import useSidebar from '../hooks/useSidebar';
import type { BackendReservation, BackendReservationStatus } from '../models/models';
import { fetchReservationsAdminList } from '../utils/reservationsApi';

// Petite fonction utilitaire pour formater les dates en français
const formatDateFR = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const ReservationsPage: React.FC = () => {
  const { sidebarOpen, openSidebar, closeSidebar } = useSidebar(false);

  const [reservations, setReservations] = useState<BackendReservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tous' | BackendReservationStatus>('Tous');
  const [propertyFilter, setPropertyFilter] = useState<'Tous' | number>('Tous');

  const [selectedReservation, setSelectedReservation] = useState<BackendReservation | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Chargement des réservations réelles depuis le backend
  useEffect(() => {
    const loadReservations = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchReservationsAdminList();
        setReservations(data ?? []);
      } catch (e) {
        console.error(e);
        setError('Impossible de récupérer les réservations.');
      } finally {
        setLoading(false);
      }
    };

    void loadReservations();
  }, []);

  const biensOptions = Array.from(
    new Map(reservations.map((r) => [r.bien.id, r.bien])).values(),
  );

  const filteredReservations = reservations.filter((reservation) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      query.length === 0 ||
      reservation.bien.nom.toLowerCase().includes(query) ||
      reservation.bien.adresse.toLowerCase().includes(query) ||
      reservation.locataire.nom.toLowerCase().includes(query) ||
      reservation.locataire.prenom.toLowerCase().includes(query) ||
      reservation.locataire.email.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === 'Tous' ? true : reservation.statut === statusFilter;

    const matchesProperty =
      propertyFilter === 'Tous' ? true : reservation.bien.id === propertyFilter;

    return matchesSearch && matchesStatus && matchesProperty;
  });

  const openDrawer = (reservation?: BackendReservation) => {
    setSelectedReservation(reservation ?? null);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedReservation(null);
  };

  const getStatusClasses = (status: BackendReservationStatus) => {
    switch (status) {
      case 'confirmée':
        return 'bg-[#ECFDF3] text-[#166534]';
      case 'terminée':
        return 'bg-[#F1F5F9] text-[#0F172A]';
      case 'annulée':
        return 'bg-[#FEF2F2] text-[#B91C1C]';
      default:
        return 'bg-[#FFFBEB] text-[#92400E]';
    }
  };

  const getStatusHelper = (status: BackendReservationStatus) => {
    switch (status) {
      case 'confirmée':
        return 'Séjour validé, prêt à être planifié (prestations, équipes).';
      case 'terminée':
        return 'Séjour terminé, utile pour le reporting et l’historique.';
      case 'annulée':
        return 'Réservation annulée, conservée pour traçabilité backoffice.';
      default:
        return "Réservation en attente de confirmation côté conciergerie.";
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA]">
      <Sidebar isOpen={sidebarOpen} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={closeSidebar}
        />
      )}

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
        <h1 className="text-sm font-semibold text-[#222B45]">Réservations</h1>
        <div className="w-8" />
      </header>

      <main className="px-4 py-4 md:ml-60 md:px-6 md:py-6 min-h-screen flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#222B45]">Réservations</h2>
            <p className="text-sm text-[#6E7B8B]">
              Suivez les séjours par bien, voyageur et utilisateur Koosy, et liez-les aux prestations.
            </p>
          </div>
          <ButtonCreate label="Nouvelle réservation" onClick={() => openDrawer()} />
        </div>

        <FiltersSection
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Rechercher par réf, bien ou voyageur…"
          summary={
            loading
              ? 'Chargement des réservations…'
              : `${filteredReservations.length} réservation${
                  filteredReservations.length > 1 ? 's' : ''
                } affichée${filteredReservations.length > 1 ? 's' : ''}`
          }
          onReset={() => {
            setSearch('');
            setStatusFilter('Tous');
            setPropertyFilter('Tous');
          }}
        >
          <SelectField
            label="Statut de la réservation"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BackendReservationStatus | 'Tous')}
          >
            <option value="Tous">Tous les statuts</option>
            <option value="en attente">En attente</option>
            <option value="confirmée">Confirmée</option>
            <option value="terminée">Terminée</option>
            <option value="annulée">Annulée</option>
          </SelectField>

          <SelectField
            label="Bien concerné"
            value={propertyFilter}
            onChange={(e) =>
              setPropertyFilter(e.target.value === 'Tous' ? 'Tous' : Number(e.target.value))
            }
          >
            <option value="Tous">Tous les biens</option>
            {biensOptions.map((bien) => (
              <option key={bien.id} value={bien.id}>
                {bien.nom} – {bien.adresse}
              </option>
            ))}
          </SelectField>
        </FiltersSection>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {error && !loading ? (
            <div className="col-span-full rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : !loading && filteredReservations.length === 0 ? (
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
                <div className="p-4 border-b border-[#E0E6ED] bg-gradient-to-r from-[#E0F7F4] via-[#F9FBFF] to-[#E0F2FE] flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-semibold text-[#1F2933] line-clamp-2">
                        {reservation.bien.nom}
                      </h3>
                      <p className="text-xs text-[#6E7B8B]">
                        {reservation.bien.adresse}
                      </p>
                      <p className="text-[11px] text-[#9EABB8]">Réservation #{reservation.id}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusClasses(reservation.statut)}`}
                      >
                        {reservation.statut}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#6E7B8B]">{getStatusHelper(reservation.statut)}</p>
                </div>

                <div className="flex-1 p-4 space-y-3 text-xs text-[#6E7B8B]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-[#0F172A]/5 flex items-center justify-center text-[10px] font-semibold text-[#0F172A]">
                        {`${reservation.locataire.prenom} ${reservation.locataire.nom}`
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-medium text-[#1F2933]">
                          {reservation.locataire.prenom} {reservation.locataire.nom}
                        </p>
                        <p className="text-[11px] text-[#6E7B8B]">
                          {reservation.locataire.email}
                        </p>
                        <p className="text-[11px] text-[#6E7B8B]">
                          {reservation.locataire.telephone ?? 'Téléphone non renseigné'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className="text-[11px] text-[#9EABB8]">Séjour</p>
                      <p className="text-xs font-medium text-[#1F2933]">
                        {formatDateFR(reservation.dateDebut as string)} →{' '}
                        {formatDateFR(reservation.dateFin as string)}
                      </p>
                      <p className="text-[11px] text-[#6E7B8B]">
                        {Math.max(
                          1,
                          Math.round(
                            (new Date(reservation.dateFin as string).getTime() -
                              new Date(reservation.dateDebut as string).getTime()) /
                              (1000 * 60 * 60 * 24),
                          ),
                        )}{' '}
                        nuit(s)
                      </p>
                    </div>
                  </div>

                  {/* Bloc de droite pour de futures infos (montant, utilisateur Koosy, etc.) quand ces champs existeront côté backend */}
                </div>

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
                  Vue connectée à ton backend Nest (biens, locataires). Le formulaire reste à brancher.
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
              {selectedReservation ? (
                <>
                  <div>
                    <p className="text-xs font-medium text-[#9EABB8] mb-1">Référence</p>
                    <p className="text-sm font-semibold text-[#1F2933]">
                      Réservation #{selectedReservation.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#9EABB8] mb-1">Bien</p>
                    <p className="text-sm font-semibold text-[#1F2933]">
                      {selectedReservation.bien.nom}
                    </p>
                    <p className="text-xs text-[#6E7B8B]">{selectedReservation.bien.adresse}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#9EABB8] mb-1">Voyageur</p>
                    <p className="text-sm font-semibold text-[#1F2933]">
                      {selectedReservation.locataire.prenom} {selectedReservation.locataire.nom}
                    </p>
                    <p className="text-xs text-[#6E7B8B]">{selectedReservation.locataire.email}</p>
                    <p className="text-xs text-[#6E7B8B]">
                      {selectedReservation.locataire.telephone ?? 'Téléphone non renseigné'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#9EABB8] mb-1">Séjour</p>
                    <p className="text-sm font-semibold text-[#1F2933]">
                      {formatDateFR(selectedReservation.dateDebut as string)} →{' '}
                      {formatDateFR(selectedReservation.dateFin as string)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#9EABB8] mb-1">Statut</p>
                    <p className="text-sm font-semibold text-[#1F2933]">{selectedReservation.statut}</p>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsPage;
