
// Page de gestion des biens
// Liste les biens liés aux utilisateurs (propriétaires) avec filtres + panneau de détail
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/sidebar';
import ButtonCreate from '../ui/buttonCreate';
import BienCard from '../components/cards';
import BienImagesCarousel from '../components/bienImagesCarousel';
import SelectField from '../ui/selectField';
import BiensForm from '../components/forms/biens/biensEditForm';
import BienCreateForm from '../components/forms/biens/bienCreateForm';
import FiltersSection from '../components/filters/filtersSection';
import useSidebar from '../hooks/useSidebar';
import type { BackendBien, BackendProprietaire, BackendUser } from '../models/models';
import { fetchBiensAdminList, createBienForUser, deleteBienAdmin, updateBienForUser } from '../utils/biensApi';
import { fetchUsersList } from '../utils/usersApi';

const BiensPage: React.FC = () => {
  // État pour la sidebar mobile (ouvert / fermé)
  const { sidebarOpen, openSidebar, closeSidebar } = useSidebar(false);
  // Filtres
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'Tous' | 'Appartement' | 'Maison' | 'Studio' | 'Chambre'>('Tous');
  const [statusFilter, setStatusFilter] = useState<'Tous' | BackendBien['statut']>('Tous');
  const [ownerFilter, setOwnerFilter] = useState<'Tous' | number>('Tous');
  const [userFilter, setUserFilter] = useState<'Tous' | number>('Tous');
  // Données réelles des biens (backend)
  const [biens, setBiens] = useState<BackendBien[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Bien sélectionné dans le panneau de détail
  const [selectedBien, setSelectedBien] = useState<BackendBien | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Données pour la création d'un nouveau bien (admin)
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [formUserId, setFormUserId] = useState<number | ''>('');
  const [formNom, setFormNom] = useState('');
  const [formAdresse, setFormAdresse] = useState('');
  const [formType, setFormType] = useState<'Appartement' | 'Maison' | 'Studio' | 'Chambre' | ''>('');
  const [formSuperficie, setFormSuperficie] = useState('');
  const [formPieces, setFormPieces] = useState('');
  const [formStatut, setFormStatut] = useState<'disponible' | 'occupé' | 'travaux'>('disponible');
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Chargement des biens depuis l'API admin
  useEffect(() => {
    const loadBiens = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchBiensAdminList();
        if (!data) {
          setError('Impossible de récupérer la liste des biens.');
          setBiens([]);
        } else {
          setBiens(data);
        }
      } catch (e) {
        console.error(e);
        setError('Une erreur est survenue lors du chargement des biens.');
        setBiens([]);
      } finally {
        setLoading(false);
      }
    };

    void loadBiens();
  }, []);

  // Chargement des utilisateurs (conciergeries) pour la création admin
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsersList();
        setUsers(data ?? []);
      } catch (e) {
        console.error(e);
      }
    };

    void loadUsers();
  }, []);

  const filteredBiens = biens.filter((bien) => {
    const searchTerm = search.trim().toLowerCase();
    const ownerFullName = bien.proprietaire
      ? `${bien.proprietaire.prenom} ${bien.proprietaire.nom}`
      : '';

    const matchesSearch =
      searchTerm.length === 0 ||
      bien.nom.toLowerCase().includes(searchTerm) ||
      (bien.adresse ?? '').toLowerCase().includes(searchTerm) ||
      ownerFullName.toLowerCase().includes(searchTerm) ||
      (bien.proprietaire?.email ?? '').toLowerCase().includes(searchTerm);

    const matchesType = typeFilter === 'Tous' ? true : bien.type === typeFilter;
    const matchesStatus = statusFilter === 'Tous' ? true : bien.statut === statusFilter;
    const matchesOwner =
      ownerFilter === 'Tous' ? true : bien.proprietaire?.id === ownerFilter;
    const matchesUser =
      userFilter === 'Tous'
        ? true
        : (bien as any)?.conciergerie?.id === userFilter;

    return matchesSearch && matchesType && matchesStatus && matchesOwner && matchesUser;
  });

  const ownersOptions: BackendProprietaire[] = Array.from(
    new Map(
      biens
        .filter((b) => b.proprietaire)
        .map((b) => [b.proprietaire!.id, b.proprietaire as BackendProprietaire]),
    ).values(),
  );

  // Ouvre le drawer avec le bien sélectionné (ou null pour création)
  const openDrawer = (bien?: BackendBien) => {
    setSelectedBien(bien ?? null);
    setFormError(null);
    setFormSaving(false);
    if (!bien) {
      // Nouveau bien : réinitialise le formulaire
      setFormUserId('');
      setFormNom('');
      setFormAdresse('');
      setFormType('');
      setFormSuperficie('');
      setFormPieces('');
      setFormStatut('disponible');
    } else {
      // Édition d'un bien existant : préremplit le formulaire
      setFormNom(bien.nom ?? '');
      setFormAdresse(bien.adresse ?? '');
      setFormType((bien.type as any) ?? '');
      setFormSuperficie(
        typeof bien.superficie === 'number' ? String(bien.superficie) : '',
      );
      setFormPieces(typeof bien.pieces === 'number' ? String(bien.pieces) : '');
      setFormStatut(bien.statut);
    }
    setDrawerOpen(true);
  };

  // Ferme le drawer
  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedBien(null);
    setFormError(null);
  };

  const handleDeleteBien = async (bien: BackendBien) => {
    const confirmed = window.confirm(`Supprimer définitivement le bien "${bien.nom}" ?`);
    if (!confirmed) return;

    try {
      setLoading(true);
      setError(null);
      await deleteBienAdmin(bien.id);
      const data = await fetchBiensAdminList();
      setBiens(data ?? []);
    } catch (e) {
      console.error(e);
      setError('Impossible de supprimer ce bien.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBien = async () => {
    try {
      setFormSaving(true);
      setFormError(null);

      if (!formUserId || !formNom || !formAdresse || !formType || !formSuperficie || !formPieces) {
        setFormError('Veuillez renseigner tous les champs obligatoires.');
        return;
      }

      const superficieNum = Number(formSuperficie);
      const piecesNum = Number(formPieces);

      if (Number.isNaN(superficieNum) || Number.isNaN(piecesNum)) {
        setFormError('Superficie et nombre de pièces doivent être des nombres.');
        return;
      }

      await createBienForUser(formUserId, {
        nom: formNom,
        adresse: formAdresse,
        type: formType,
        superficie: superficieNum,
        pieces: piecesNum,
        statut: formStatut,
      });

      // Recharge la liste des biens après création
      const data = await fetchBiensAdminList();
      setBiens(data ?? []);

      closeDrawer();
    } catch (e) {
      console.error(e);
      setFormError('Impossible de créer le bien.');
    } finally {
      setFormSaving(false);
    }
  };

  const handleUpdateBien = async () => {
    if (!selectedBien) return;

    try {
      setFormSaving(true);
      setFormError(null);

      if (!formNom || !formAdresse || !formType || !formSuperficie || !formPieces) {
        setFormError('Veuillez renseigner tous les champs obligatoires.');
        return;
      }

      const superficieNum = Number(formSuperficie);
      const piecesNum = Number(formPieces);

      if (Number.isNaN(superficieNum) || Number.isNaN(piecesNum)) {
        setFormError('Superficie et nombre de pièces doivent être des nombres.');
        return;
      }

      const userId = (selectedBien as any)?.conciergerie?.id as number | undefined;
      if (!userId) {
        setFormError("Impossible de déterminer l'utilisateur (conciergerie) lié à ce bien.");
        return;
      }

      await updateBienForUser(userId, selectedBien.id, {
        nom: formNom,
        adresse: formAdresse,
        type: formType,
        superficie: superficieNum,
        pieces: piecesNum,
        statut: formStatut,
      });

      const data = await fetchBiensAdminList();
      setBiens(data ?? []);

      closeDrawer();
    } catch (e) {
      console.error(e);
      setFormError('Impossible de mettre à jour le bien.');
    } finally {
      setFormSaving(false);
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
          onClick={closeSidebar}
        />
      )}

      {/* Topbar mobile avec bouton burger et titre */}
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
        <h1 className="text-sm font-semibold text-[#222B45]">Biens</h1>
        <div className="w-8" />
      </header>

      {/* Contenu principal de la page biens */}
      <main className="px-4 py-4 md:ml-60 md:px-6 md:py-6 min-h-screen flex flex-col gap-4">
        {/* En-tête */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#222B45]">Biens</h2>
            <p className="text-sm text-[#6E7B8B]">
              Gérez les biens liés aux comptes utilisateurs Koosy (propriétaires).
            </p>
          </div>
          <ButtonCreate label="Nouveau bien" onClick={() => openDrawer()} />
        </div>

        {/* Filtres */}
        <FiltersSection
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Rechercher par nom de bien, ville ou propriétaire…"
          filtersClassName="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm"
          summary={
            loading
              ? 'Chargement des biens…'
              : `${filteredBiens.length} bien${filteredBiens.length > 1 ? 's' : ''} affiché${
                  filteredBiens.length > 1 ? 's' : ''
                }`
          }
          onReset={() => {
            setSearch('');
            setTypeFilter('Tous');
            setStatusFilter('Tous');
            setOwnerFilter('Tous');
            setUserFilter('Tous');
          }}
        >
          <SelectField
            label="Type de bien"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
          >
            <option value="Tous">Tous</option>
            <option value="Appartement">Appartement</option>
            <option value="Maison">Maison</option>
            <option value="Studio">Studio</option>
            <option value="Chambre">Chambre</option>
          </SelectField>

          <SelectField
            label="Statut du bien"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="Tous">Tous</option>
            <option value="disponible">Disponible</option>
            <option value="occupé">Occupé</option>
            <option value="travaux">En travaux</option>
          </SelectField>

          <SelectField
            label="Propriétaire"
            value={ownerFilter}
            onChange={(e) =>
              setOwnerFilter(e.target.value === 'Tous' ? 'Tous' : Number(e.target.value))
            }
          >
            <option value="Tous">Tous les propriétaires</option>
            {ownersOptions.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.prenom} {owner.nom}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Utilisateur (conciergerie)"
            value={userFilter}
            onChange={(e) =>
              setUserFilter(e.target.value === 'Tous' ? 'Tous' : Number(e.target.value))
            }
          >
            <option value="Tous">Tous les utilisateurs</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.prenom} {u.nom} — {u.email}
              </option>
            ))}
          </SelectField>
        </FiltersSection>

        {/* Grille de biens */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {error && !loading ? (
            <div className="col-span-full rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : !loading && filteredBiens.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-[#E0E6ED] bg-[#F9FBFF] p-6 text-center text-sm text-[#6E7B8B]">
              <p className="font-medium mb-1">Aucun bien ne correspond à vos filtres.</p>
              <p className="text-[12px] text-[#9EABB8] mb-3">
                Essayez de modifier les critères ou d’ajouter un nouveau bien.
              </p>
              <button
                type="button"
                onClick={() => openDrawer()}
                className="inline-flex items-center justify-center rounded-lg bg-[#00A896] px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#00897B]"
              >
                Ajouter un bien
              </button>
            </div>
          ) : (
            filteredBiens.map((bien) => (
              <BienCard
                key={bien.id}
                bien={bien}
                onOpen={openDrawer}
                onDelete={handleDeleteBien}
              />
            ))
          )}
        </section>
      </main>

      {/* Drawer latéral pour créer un bien (admin) ou consulter un bien existant */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/20" onClick={closeDrawer} />
          <div className="relative ml-auto h-full w-full max-w-md bg-white shadow-xl border-l border-[#E0E6ED] flex flex-col">
            <header className="px-5 py-4 border-b border-[#E0E6ED] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#222B45]">
                  {selectedBien ? 'Détail du bien' : 'Nouveau bien (admin)'}
                </h2>
                <p className="text-[11px] text-[#9EABB8]">
                  {selectedBien
                    ? 'Visualisation des informations du bien existant.'
                    : 'Créer un bien pour un utilisateur (conciergerie) choisi.'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-full p-1.5 text-[#9EABB8] hover:bg-[#F4F7FA]"
              >
                ✕
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 text-sm">
              {selectedBien && (
                <section className="rounded-xl border border-[#E0E6ED] bg-white p-3">
                  <BienImagesCarousel
                    images={selectedBien.images}
                    alt={selectedBien.nom}
                    heightClass="h-40 md:h-56"
                  />
                </section>
              )}

              {selectedBien ? (
                <>
                  {/* En-tête de la fiche avec nom + statut (backend) */}
                  <section className="rounded-xl border border-[#E0E6ED] bg-[#F9FBFF] p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-[11px] text-[#9EABB8]">Nom du bien</p>
                        <p className="text-sm font-semibold text-[#222B45]">
                          {selectedBien.nom}
                        </p>
                        <p className="text-[11px] text-[#6E7B8B]">
                          {selectedBien.adresse}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            selectedBien.statut === 'disponible'
                              ? 'bg-[#ECFDF3] text-[#166534]'
                              : selectedBien.statut === 'occupé'
                                ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                                : 'bg-[#FFFBEB] text-[#92400E]'
                          }`}
                        >
                          {selectedBien.statut === 'disponible' && 'Disponible'}
                          {selectedBien.statut === 'occupé' && 'Occupé'}
                          {selectedBien.statut === 'travaux' && 'En travaux'}
                        </span>
                        <p className="text-[11px] text-[#9EABB8]">
                          Type&nbsp;: <span className="text-[#222B45]">{selectedBien.type}</span>
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Bloc propriétaire */}
                  <section className="rounded-xl border border-[#E0E6ED] bg-white p-4 space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-[#9EABB8]">
                      Propriétaire du bien
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-[#0F172A]/5 flex items-center justify-center text-xs font-semibold text-[#0F172A]">
                        {selectedBien.proprietaire
                          ? `${selectedBien.proprietaire.prenom} ${selectedBien.proprietaire.nom}`
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                          : ''}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-[#222B45]">
                          {selectedBien.proprietaire
                            ? `${selectedBien.proprietaire.prenom} ${selectedBien.proprietaire.nom}`
                            : '—'}
                        </p>
                        <p className="text-[11px] text-[#6E7B8B]">
                          {selectedBien.proprietaire?.email ?? ''}
                        </p>
                        <p className="text-[11px] text-[#9EABB8]">Propriétaire enregistré pour ce bien.</p>
                      </div>
                    </div>
                  </section>

                  {/* Formulaire d'édition du bien (admin) */}
                  <BiensForm
                    formError={formError}
                    formNom={formNom}
                    formAdresse={formAdresse}
                    formType={formType}
                    formSuperficie={formSuperficie}
                    formPieces={formPieces}
                    formStatut={formStatut}
                    onChangeNom={setFormNom}
                    onChangeAdresse={setFormAdresse}
                    onChangeType={setFormType as any}
                    onChangeSuperficie={setFormSuperficie}
                    onChangePieces={setFormPieces}
                    onChangeStatut={setFormStatut as any}
                  />
                </>
              ) : (
                <BienCreateForm
                  formError={formError}
                  users={users}
                  formUserId={formUserId}
                  onChangeUserId={setFormUserId}
                  formNom={formNom}
                  formAdresse={formAdresse}
                  formType={formType}
                  formSuperficie={formSuperficie}
                  formPieces={formPieces}
                  formStatut={formStatut}
                  onChangeNom={setFormNom}
                  onChangeAdresse={setFormAdresse}
                  onChangeType={setFormType as any}
                  onChangeSuperficie={setFormSuperficie}
                  onChangePieces={setFormPieces}
                  onChangeStatut={setFormStatut as any}
                />
              )}
            </div>

            <footer className="px-5 py-4 border-t border-[#E0E6ED] flex justify-end gap-2 bg-white">
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-lg border border-[#E0E6ED] bg-white px-4 py-2 text-xs font-medium text-[#6E7B8B] hover:bg-[#F4F7FA]"
              >
                Annuler
              </button>
              {!selectedBien && (
                <button
                  type="button"
                  onClick={handleCreateBien}
                  disabled={formSaving}
                  className="rounded-lg bg-[#00A896] px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#00897B] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {formSaving ? 'Création…' : 'Créer le bien'}
                </button>
              )}
              {selectedBien && (
                <button
                  type="button"
                  onClick={handleUpdateBien}
                  disabled={formSaving}
                  className="rounded-lg bg-[#00A896] px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#00897B] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {formSaving ? 'Enregistrement…' : 'Enregistrer les modifications'}
                </button>
              )}
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiensPage;