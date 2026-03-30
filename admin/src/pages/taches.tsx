// Page de gestion des tâches
// Connectée au backend Nest pour afficher les vraies tâches (vue admin)
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/sidebar';
import SelectField from '../ui/selectField';
import ButtonCreate from '../ui/buttonCreate';
import FiltersSection from '../components/filters/filtersSection';
import DrawerShell from '../ui/DrawerShell';
import useSidebar from '../hooks/useSidebar';
import type { BackendTache, BackendTacheStatus, BackendUser } from '../models/models';
import { fetchTachesAdminList } from '../utils/tachesApi';

// Formattage simple de la date en français
const formatDateFR = (dateString: string | Date) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Retourne les classes Tailwind selon le statut
const getStatusClasses = (status: BackendTacheStatus) => {
  switch (status) {
    case 'à faire':
      return 'bg-[#FFFBEB] text-[#92400E]';
    case 'terminée':
      return 'bg-[#ECFDF3] text-[#166534]';
    default:
      return 'bg-[#E5E7EB] text-[#374151]';
  }
};

const TachesPage: React.FC = () => {
  const { sidebarOpen, openSidebar, closeSidebar } = useSidebar(false);

  const [taches, setTaches] = useState<BackendTache[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tous' | BackendTacheStatus>('Tous');
  const [userFilter, setUserFilter] = useState<'Tous' | number>('Tous');

  const [selectedTache, setSelectedTache] = useState<BackendTache | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Chargement des tâches réelles (vue admin)
  useEffect(() => {
    const loadTaches = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTachesAdminList();
        setTaches(data ?? []);
      } catch (e) {
        console.error(e);
        setError('Impossible de récupérer les tâches.');
      } finally {
        setLoading(false);
      }
    };

    void loadTaches();
  }, []);

  const utilisateursConciergerie: BackendUser[] = Array.from(
    new Map(
      taches
        .map((t) => t.bien.conciergerie)
        .filter((u): u is BackendUser => !!u)
        .map((u) => [u.id, u]),
    ).values(),
  );

  const filteredTaches = taches.filter((tache) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      query.length === 0 ||
      tache.titre.toLowerCase().includes(query) ||
      (tache.description ?? '').toLowerCase().includes(query) ||
      tache.bien.nom.toLowerCase().includes(query) ||
      tache.bien.adresse.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'Tous' ? true : tache.statut === statusFilter;

    const matchesUser =
      userFilter === 'Tous'
        ? true
        : tache.bien.conciergerie?.id === userFilter;

    return matchesSearch && matchesStatus && matchesUser;
  });

  const openDrawer = (tache?: BackendTache) => {
    setSelectedTache(tache ?? null);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedTache(null);
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
        <h1 className="text-sm font-semibold text-[#222B45]">Tâches</h1>
        <div className="w-8" />
      </header>

      <main className="px-4 py-4 md:ml-60 md:px-6 md:py-6 min-h-screen flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#222B45]">Tâches</h2>
            <p className="text-sm text-[#6E7B8B]">
              Suivez les tâches internes liées aux séjours, prestations et à la relation propriétaire.
            </p>
          </div>
          <ButtonCreate label="Nouvelle tâche" onClick={() => openDrawer()} />
        </div>

        <FiltersSection
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Rechercher par titre, description ou bien…"
          summary={
            loading
              ? 'Chargement des tâches…'
              : `${filteredTaches.length} tâche${filteredTaches.length > 1 ? 's' : ''} affichée${
                  filteredTaches.length > 1 ? 's' : ''
                }`
          }
          onReset={() => {
            setSearch('');
            setStatusFilter('Tous');
            setUserFilter('Tous');
          }}
        >
          <SelectField
            label="Statut"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BackendTacheStatus | 'Tous')}
          >
            <option value="Tous">Tous les statuts</option>
            <option value="à faire">À faire</option>
            <option value="terminée">Terminée</option>
          </SelectField>

          <SelectField
            label="Utilisateur Koosy"
            value={userFilter}
            onChange={(e) =>
              setUserFilter(e.target.value === 'Tous' ? 'Tous' : Number(e.target.value))
            }
          >
            <option value="Tous">Tous les utilisateurs</option>
            {utilisateursConciergerie.map((user) => (
              <option key={user.id} value={user.id}>
                {user.prenom} {user.nom} ({user.email})
              </option>
            ))}
          </SelectField>
        </FiltersSection>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {error && !loading ? (
            <div className="col-span-full rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : !loading && filteredTaches.length === 0 ? (
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
                <div className="p-4 border-b border-[#E0E6ED] bg-gradient-to-r from-[#E0F7F4] via-[#F9FBFF] to-[#E0F2FE] flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-[#1F2933] line-clamp-2">
                      {tache.titre}
                    </h3>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusClasses(tache.statut)}`}
                      >
                        {tache.statut}
                      </span>
                    </div>
                  </div>
                  {tache.bien && (
                    <p className="text-[11px] text-[#6E7B8B]">
                      {tache.bien.nom} · {tache.bien.adresse}
                    </p>
                  )}
                  {tache.description && (
                    <p className="text-[11px] text-[#6E7B8B] line-clamp-2">{tache.description}</p>
                  )}
                </div>

                <div className="flex-1 p-4 space-y-3 text-xs text-[#6E7B8B]">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[11px] text-[#9EABB8]">Échéance</p>
                      <p className="text-sm font-semibold text-[#1F2933]">
                        {tache.dateEcheance ? formatDateFR(tache.dateEcheance) : 'Non définie'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#9EABB8]">Créée le</p>
                      <p className="text-sm font-semibold text-[#1F2933]">
                        {formatDateFR(tache.dateCreation)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    {tache.bien.conciergerie && (
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-[#0F172A]/5 flex items-center justify-center text-[10px] font-semibold text-[#0F172A]">
                          {`${tache.bien.conciergerie.prenom} ${tache.bien.conciergerie.nom}`
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-medium text-[#1F2933]">
                            {tache.bien.conciergerie.prenom} {tache.bien.conciergerie.nom}
                          </p>
                          <p className="text-[11px] text-[#6E7B8B]">
                            {tache.bien.conciergerie.email}
                          </p>
                          <p className="text-[11px] text-[#9EABB8]">Conciergerie en charge du bien</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <footer className="flex flex-col gap-2 border-t border-[#E0E6ED] bg-[#F9FBFF] px-4 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openDrawer(tache)}
                      className="rounded-full border border-transparent px-2 py-0.5 text-[#00A896] hover:bg-[#D1FAF5]"
                    >
                      Voir le détail de la tâche
                    </button>
                  </div>
                  <p className="text-[10px] text-[#9EABB8]">
                    Vue connectée à ton API Nest (module tâches / to-do interne, vue admin).
                  </p>
                </footer>
              </article>
            ))
          )}
        </section>
      </main>

      <DrawerShell
        open={drawerOpen}
        title={selectedTache ? 'Détail de la tâche' : 'Nouvelle tâche'}
        subtitle="Vue connectée à ton backend Nest (tâches / assignation utilisateurs). Le formulaire de création reste à brancher."
        onClose={closeDrawer}
      >
        {selectedTache ? (
          <>
            <div>
              <p className="text-xs font-medium text-[#9EABB8] mb-1">Titre</p>
              <p className="text-sm font-semibold text-[#1F2933]">{selectedTache.titre}</p>
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
                <p className="text-sm font-semibold text-[#1F2933]">{selectedTache.statut}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#9EABB8]">Échéance</p>
                <p className="text-sm font-semibold text-[#1F2933]">
                  {selectedTache.dateEcheance ? formatDateFR(selectedTache.dateEcheance) : 'Non définie'}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#9EABB8]">Créée le</p>
                <p className="text-sm font-semibold text-[#1F2933]">
                  {formatDateFR(selectedTache.dateCreation)}
                </p>
              </div>
            </div>
            {selectedTache.bien && (
              <div>
                <p className="text-xs font-medium text-[#9EABB8] mb-1">Bien concerné</p>
                <p className="text-sm font-semibold text-[#1F2933]">{selectedTache.bien.nom}</p>
                <p className="text-xs text-[#6E7B8B]">{selectedTache.bien.adresse}</p>
              </div>
            )}
            {selectedTache.bien.conciergerie && (
              <div>
                <p className="text-xs font-medium text-[#9EABB8] mb-1">Conciergerie en charge</p>
                <p className="text-sm font-semibold text-[#1F2933]">
                  {selectedTache.bien.conciergerie.prenom} {selectedTache.bien.conciergerie.nom}
                </p>
                <p className="text-xs text-[#6E7B8B]">{selectedTache.bien.conciergerie.email}</p>
              </div>
            )}
            <p className="text-[11px] text-[#9EABB8]">
              Ici tu pourras plus tard modifier le statut, réassigner la tâche, ou créer un lien direct vers la réservation / prestation concernée.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-[#6E7B8B]">
              Ici, tu pourras créer une nouvelle tâche en choisissant un utilisateur assigné,
              une échéance, une priorité, et en la liant à une réservation ou une prestation.
            </p>
            <p className="text-[11px] text-[#9EABB8]">
              Pour l’instant, ce formulaire de création est mocké : lorsque tu auras les endpoints
              correspondants dans ton API Nest, on pourra le brancher.
            </p>
          </>
        )}
      </DrawerShell>
    </div>
  );
};

export default TachesPage;
