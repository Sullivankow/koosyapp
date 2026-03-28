
// Page de gestion des biens
// Liste les biens liés aux utilisateurs (propriétaires) avec filtres + panneau de détail (mock)
import React, { useState } from 'react';
import Sidebar from '../components/sidebar';
// Import centralisé des types et données mock pour les biens
import type { Bien } from '../models/mocks';
import { mockBiens, mockOwners } from '../models/mocks';

const BiensPage: React.FC = () => {
  // État pour la sidebar mobile (ouvert / fermé)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Filtres
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'Tous' | Bien['type']>('Tous');
  const [statusFilter, setStatusFilter] = useState<'Tous' | Bien['status']>('Tous');
  const [ownerFilter, setOwnerFilter] = useState<'Tous' | number>('Tous');
  // Bien sélectionné dans le panneau de détail
  const [selectedBien, setSelectedBien] = useState<Bien | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filtrage de la liste des biens (mock)
  const filteredBiens = mockBiens.filter((bien) => {
    const matchesSearch =
      search.trim().length === 0 ||
      bien.name.toLowerCase().includes(search.toLowerCase()) ||
      bien.city.toLowerCase().includes(search.toLowerCase()) ||
      bien.owner.name.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === 'Tous' ? true : bien.type === typeFilter;
    const matchesStatus = statusFilter === 'Tous' ? true : bien.status === statusFilter;
    const matchesOwner = ownerFilter === 'Tous' ? true : bien.owner.id === ownerFilter;

    return matchesSearch && matchesType && matchesStatus && matchesOwner;
  });

  // Ouvre le drawer avec le bien sélectionné (ou null pour création)
  const openDrawer = (bien?: Bien) => {
    setSelectedBien(bien ?? null);
    setDrawerOpen(true);
  };

  // Ferme le drawer
  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedBien(null);
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
          <button
            type="button"
            onClick={() => openDrawer()}
            className="inline-flex items-center justify-center rounded-lg bg-[#00A896] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#00897B] transition-colors"
          >
            <span className="mr-2 text-lg">+</span>
            Nouveau bien
          </button>
        </div>

        {/* Filtres */}
        <section className="rounded-2xl bg-white border border-[#E0E6ED] p-4 sm:p-5 space-y-4">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#9EABB8] text-sm">
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom de bien, ville ou propriétaire…"
              className="w-full rounded-lg border border-[#E0E6ED] bg-[#F9FBFF] py-2.5 pl-9 pr-3 text-sm text-[#222B45] placeholder:text-[#9EABB8] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3 text-sm">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#6E7B8B]">Type de bien</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="w-full rounded-lg border border-[#E0E6ED] bg-white px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
              >
                <option value="Tous">Tous</option>
                <option value="Appartement">Appartement</option>
                <option value="Maison">Maison</option>
                <option value="Studio">Studio</option>
                <option value="Chambre">Chambre</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#6E7B8B]">Statut (workflow back office)</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full rounded-lg border border-[#E0E6ED] bg-white px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
              >
                <option value="Tous">Tous</option>
                <option value="Brouillon">Brouillon</option>
                <option value="En attente de validation">En attente de validation</option>
                <option value="Actif">Actif</option>
                <option value="Suspendu">Suspendu</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#6E7B8B]">Propriétaire</label>
              <select
                value={ownerFilter}
                onChange={(e) =>
                  setOwnerFilter(e.target.value === 'Tous' ? 'Tous' : Number(e.target.value))
                }
                className="w-full rounded-lg border border-[#E0E6ED] bg-white px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
              >
                <option value="Tous">Tous les propriétaires</option>
                {mockOwners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col items-start justify-end gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-[#9EABB8]">
              {filteredBiens.length} bien{filteredBiens.length > 1 ? 's' : ''} affiché
              {filteredBiens.length > 1 ? 's' : ''}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setTypeFilter('Tous');
                setStatusFilter('Tous');
                setOwnerFilter('Tous');
              }}
              className="text-[11px] font-medium text-[#00A896] hover:text-[#00897B]"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </section>

        {/* Grille de biens */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredBiens.length === 0 ? (
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
              <article
                key={bien.id}
                className="flex flex-col rounded-2xl border border-[#E0E6ED] bg-white shadow-sm overflow-hidden"
              >
                {/* Image placeholder */}
                <div className="h-32 bg-gradient-to-br from-[#E0F7F4] via-[#F9FBFF] to-[#E0F2FE]" />
                <div className="flex-1 p-4 space-y-2 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <h3 className="font-semibold text-[#1F2933] line-clamp-2">
                        {bien.name}
                      </h3>
                      <p className="text-xs text-[#6E7B8B]">
                        {bien.city}, {bien.country}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          bien.status === 'Actif'
                            ? 'bg-[#ECFDF3] text-[#166534]'
                          : bien.status === 'En attente de validation'
                            ? 'bg-[#FFFBEB] text-[#92400E]'
                          : bien.status === 'Suspendu'
                            ? 'bg-[#FEF2F2] text-[#B91C1C]'
                          : 'bg-[#EFF6FF] text-[#1D4ED8]'
                        }`}
                      >
                        {bien.status}
                      </span>
                      <span className="text-[10px] text-[#9EABB8]">
                        {bien.status === 'Actif' && 'Bien validé et exploité par la conciergerie.'}
                        {bien.status === 'En attente de validation' &&
                          'Créé par la conciergerie, en attente de validation back office.'}
                        {bien.status === 'Suspendu' &&
                          'Bien suspendu par le back office (non visible côté conciergerie).'}
                        {bien.status === 'Brouillon' &&
                          'Brouillon côté conciergerie, pas encore prêt pour validation.'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#6E7B8B]">
                    <p>
                      {bien.capacity.guests} voyageurs · {bien.capacity.bedrooms} chambres ·{' '}
                      {bien.capacity.bathrooms} salle{bien.capacity.bathrooms > 1 ? 's' : ''} de bain
                    </p>
                    <p className="font-semibold text-[#1F2933]">
                      {bien.pricePerNight} € <span className="font-normal text-xs text-[#6E7B8B]">/ nuit</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-[#0F172A]/5 flex items-center justify-center text-[10px] font-semibold text-[#0F172A]">
                        {bien.owner.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-medium text-[#1F2933]">{bien.owner.name}</p>
                        <p className="text-[11px] text-[#6E7B8B]">{bien.owner.email}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#6E7B8B]">
                      Taux d’occupation :{' '}
                      <span className="font-semibold text-[#00A896]">{bien.occupancyRate}%</span>
                    </p>
                  </div>
                </div>

                <footer className="flex flex-col gap-2 border-t border-[#E0E6ED] bg-[#F9FBFF] px-4 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openDrawer(bien)}
                      className="rounded-full border border-transparent px-2 py-0.5 text-[#00A896] hover:bg-[#D1FAF5]"
                    >
                      Voir la fiche bien
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-transparent px-2 py-0.5 text-[#9EABB8] hover:bg-[#F4F7FA]"
                    >
                      Voir la conciergerie
                    </button>
                    <span className="hidden text-[10px] text-[#9EABB8] md:inline">
                      Actions back office simulées, à connecter à ton API.
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 justify-end">
                    <button
                      type="button"
                      className="rounded-full border border-[#E0E6ED] bg-white px-2 py-0.5 text-[11px] text-[#6E7B8B] hover:bg-[#F4F7FA]"
                    >
                      Valider le bien (mock)
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-transparent px-2 py-0.5 text-[11px] text-[#B91C1C] hover:bg-[#FEE2E2]"
                    >
                      Suspendre (mock)
                    </button>
                  </div>
                </footer>
              </article>
            ))
          )}
        </section>
      </main>

      {/* Drawer latéral pour créer / éditer un bien (mock) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/20" onClick={closeDrawer} />
          <div className="relative ml-auto h-full w-full max-w-md bg-white shadow-xl border-l border-[#E0E6ED] flex flex-col">
            <header className="px-5 py-4 border-b border-[#E0E6ED] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#222B45]">
                  {selectedBien ? 'Modifier le bien' : 'Nouveau bien'}
                </h2>
                <p className="text-[11px] text-[#9EABB8]">
                  Formulaire mocké à connecter à ton backend Nest (biens + propriétaires).
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
              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[#9EABB8]">
                  Informations générales
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#6E7B8B]">Nom du bien</label>
                    <input
                      type="text"
                      defaultValue={selectedBien?.name ?? ''}
                      className="w-full rounded-lg border border-[#E0E6ED] px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
                      placeholder="Ex : Appartement lumineux centre-ville"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-[#6E7B8B]">Ville</label>
                      <input
                        type="text"
                        defaultValue={selectedBien?.city ?? ''}
                        className="w-full rounded-lg border border-[#E0E6ED] px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
                        placeholder="Ex : Paris"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-[#6E7B8B]">Pays</label>
                      <input
                        type="text"
                        defaultValue={selectedBien?.country ?? ''}
                        className="w-full rounded-lg border border-[#E0E6ED] px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
                        placeholder="Ex : France"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#6E7B8B]">Type de bien</label>
                    <select
                      defaultValue={selectedBien?.type ?? 'Appartement'}
                      className="w-full rounded-lg border border-[#E0E6ED] bg-white px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
                    >
                      <option value="Appartement">Appartement</option>
                      <option value="Maison">Maison</option>
                      <option value="Studio">Studio</option>
                      <option value="Chambre">Chambre</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[#9EABB8]">
                  Propriétaire du bien
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#6E7B8B]">Compte propriétaire</label>
                    <select
                      defaultValue={selectedBien?.owner.id ?? mockOwners[0].id}
                      className="w-full rounded-lg border border-[#E0E6ED] bg-white px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
                    >
                      {mockOwners.map((owner) => (
                        <option key={owner.id} value={owner.id}>
                          {owner.name} – {owner.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[11px] text-[#9EABB8]">
                    Ce bien sera visible depuis le compte de cet utilisateur dans l’app Koosy.
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[#9EABB8]">
                  Capacité & tarifs
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-[#6E7B8B]">Voyageurs</label>
                      <input
                        type="number"
                        min={1}
                        defaultValue={selectedBien?.capacity.guests ?? 2}
                        className="w-full rounded-lg border border-[#E0E6ED] px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-[#6E7B8B]">Chambres</label>
                      <input
                        type="number"
                        min={0}
                        defaultValue={selectedBien?.capacity.bedrooms ?? 1}
                        className="w-full rounded-lg border border-[#E0E6ED] px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-[#6E7B8B]">Salles de bain</label>
                      <input
                        type="number"
                        min={0}
                        defaultValue={selectedBien?.capacity.bathrooms ?? 1}
                        className="w-full rounded-lg border border-[#E0E6ED] px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#6E7B8B]">Prix par nuit (€)</label>
                    <input
                      type="number"
                      min={0}
                      defaultValue={selectedBien?.pricePerNight ?? 100}
                      className="w-full rounded-lg border border-[#E0E6ED] px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
                    />
                  </div>
                </div>
              </section>
            </div>

            <footer className="px-5 py-4 border-t border-[#E0E6ED] flex justify-end gap-2 bg-white">
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-lg border border-[#E0E6ED] bg-white px-4 py-2 text-xs font-medium text-[#6E7B8B] hover:bg-[#F4F7FA]"
              >
                Annuler
              </button>
              <button
                type="button"
                className="rounded-lg bg-[#00A896] px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#00897B]"
              >
                Enregistrer (mock)
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiensPage;