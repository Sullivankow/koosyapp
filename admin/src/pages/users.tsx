// Page de gestion des utilisateurs
// Liste les comptes, permet de filtrer et d'ouvrir un panneau de détails (mock pour l'instant)
import React, { useState } from 'react';
import Sidebar from '../components/sidebar';

// Type représentant un utilisateur dans cette page (mock local)
type User = {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Utilisateur';
  status: 'Actif' | 'Inactif';
  lastLogin: string;
};

// Données mockées pour l'affichage en attendant la connexion à l'API backend
const mockUsers: User[] = [
  {
    id: 1,
    name: 'Julie Martin',
    email: 'julie.martin@example.com',
    role: 'Admin',
    status: 'Actif',
    lastLogin: 'Aujourd’hui, 09:24',
  },
  {
    id: 2,
    name: 'Samuel Dupont',
    email: 'samuel.dupont@example.com',
    role: 'Manager',
    status: 'Actif',
    lastLogin: 'Hier, 18:02',
  },
  {
    id: 3,
    name: 'Lina Costa',
    email: 'lina.costa@example.com',
    role: 'Utilisateur',
    status: 'Inactif',
    lastLogin: 'Il y a 15 jours',
  },
];

const Users: React.FC = () => {
  // État pour la sidebar mobile (ouvert / fermé)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Texte de recherche (nom / email)
  const [search, setSearch] = useState('');
  // Filtre sur le rôle (Tous, Admin, Manager...)
  const [roleFilter, setRoleFilter] = useState<'Tous' | User['role']>('Tous');
  // Filtre sur le statut (Tous, Actif, Inactif)
  const [statusFilter, setStatusFilter] = useState<'Tous' | User['status']>('Tous');
  // Utilisateur actuellement sélectionné dans le drawer (ou null si création)
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  // Booléen indiquant si le drawer (panneau latéral) est ouvert
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Applique les filtres (recherche, rôle, statut) sur la liste mockée
  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'Tous' ? true : user.role === roleFilter;
    const matchesStatus = statusFilter === 'Tous' ? true : user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Ouvre le drawer pour créer ou éditer un utilisateur
  const handleOpenDrawer = (user?: User) => {
    setSelectedUser(user ?? null);
    setDrawerOpen(true);
  };

  // Ferme le drawer et réinitialise l'utilisateur sélectionné
  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA]">
      {/* Sidebar responsive : visible sur desktop et coulissante sur mobile */}
      <Sidebar isOpen={sidebarOpen} />

      {/* Overlay mobile : clique dessus pour fermer la sidebar */}
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
        <h1 className="text-sm font-semibold text-[#222B45]">Utilisateurs</h1>
        {/* Espace vide pour équilibrer le header */}
        <div className="w-8" />
      </header>

      {/* Contenu principal de la page utilisateurs */}
      <main className="px-4 py-4 md:ml-60 md:px-6 md:py-6 flex min-h-screen">
        <div className="w-full max-w-6xl mx-auto space-y-6">
          {/* En-tête */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#222B45]">Utilisateurs</h1>
              <p className="text-sm text-[#6E7B8B]">
                Gérez les accès, les rôles et le statut des comptes Koosy.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenDrawer()}
              className="inline-flex items-center justify-center rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1D4ED8] transition-colors"
            >
              <span className="mr-2 text-lg">+</span>
              Nouvel utilisateur
            </button>
          </div>

          {/* Filtres & recherche */}
          <section className="rounded-2xl bg-white border border-[#E0E6ED] p-4 sm:p-5 space-y-4">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#9EABB8] text-sm">
                🔍
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom, email…"
                className="w-full rounded-lg border border-[#E0E6ED] bg-[#F9FBFF] py-2.5 pl-9 pr-3 text-sm text-[#222B45] placeholder:text-[#9EABB8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB]"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3 text-sm">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#6E7B8B]">Rôle</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="w-full rounded-lg border border-[#E0E6ED] bg-white px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB]"
                >
                  <option value="Tous">Tous</option>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Utilisateur">Utilisateur</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#6E7B8B]">Statut</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full rounded-lg border border-[#E0E6ED] bg-white px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB]"
                >
                  <option value="Tous">Tous</option>
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                </select>
              </div>

              <div className="flex flex-col justify-end items-start sm:items-end gap-2">
                <p className="text-[11px] text-[#9EABB8]">
                  {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} affiché
                  {filteredUsers.length > 1 ? 's' : ''}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setRoleFilter('Tous');
                    setStatusFilter('Tous');
                  }}
                  className="text-[11px] font-medium text-[#2563EB] hover:text-[#1D4ED8]"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          </section>

          {/* Tableau des utilisateurs */}
          <section className="rounded-2xl bg-white border border-[#E0E6ED] overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between border-b border-[#E0E6ED] bg-[#F9FBFF]">
              <h2 className="text-sm font-semibold text-[#222B45]">Liste des utilisateurs</h2>
              <span className="text-[11px] text-[#9EABB8]">Mock de données à connecter à l’API</span>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#6E7B8B]">
                <p className="mb-2 font-medium">Aucun utilisateur ne correspond à vos filtres.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setRoleFilter('Tous');
                    setStatusFilter('Tous');
                  }}
                  className="rounded-lg border border-[#E0E6ED] bg-[#F9FBFF] px-3 py-1.5 text-xs font-medium text-[#2563EB] hover:bg-[#E5EDFF]"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#F4F7FA] text-left text-[11px] uppercase tracking-wide text-[#9EABB8]">
                    <tr>
                      <th className="px-5 py-3 font-medium">Utilisateur</th>
                      <th className="px-5 py-3 font-medium">Rôle</th>
                      <th className="px-5 py-3 font-medium">Statut</th>
                      <th className="px-5 py-3 font-medium">Dernière connexion</th>
                      <th className="px-5 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E6ED] bg-white">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-[#F9FBFF] transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E3F2FD] text-xs font-semibold text-[#1976D2]">
                              {user.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium text-[#222B45]">{user.name}</p>
                              <p className="text-xs text-[#6E7B8B]">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3">
                          <span className="inline-flex rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[11px] font-medium text-[#475569]">
                            {user.role}
                          </span>
                        </td>

                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                              user.status === 'Actif'
                                ? 'bg-[#ECFDF3] text-[#166534]'
                                : 'bg-[#FEF2F2] text-[#B91C1C]'
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>

                        <td className="px-5 py-3 text-xs text-[#6E7B8B]">{user.lastLogin}</td>

                        <td className="px-5 py-3 text-right">
                          <div className="inline-flex items-center gap-2 text-xs">
                            <button
                              type="button"
                              onClick={() => handleOpenDrawer(user)}
                              className="rounded-full border border-transparent px-2 py-1 text-[#2563EB] hover:bg-[#E5EDFF]"
                            >
                              Détails
                            </button>
                            <button
                              type="button"
                              className="rounded-full border border-transparent px-2 py-1 text-[#9EABB8] hover:bg-[#F4F7FA]"
                            >
                              …
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Drawer latéral mocké */}
          {drawerOpen && (
            <div className="fixed inset-0 z-30 flex">
              <div
                className="fixed inset-0 bg-black/20"
                onClick={handleCloseDrawer}
              />
              <div className="relative ml-auto h-full w-full max-w-md bg-white shadow-xl border-l border-[#E0E6ED] flex flex-col">
                <header className="px-5 py-4 border-b border-[#E0E6ED] flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-[#222B45]">
                      {selectedUser ? 'Modifier l’utilisateur' : 'Nouvel utilisateur'}
                    </h2>
                    <p className="text-[11px] text-[#9EABB8]">
                      Formulaire mocké à connecter à ton backend Nest.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseDrawer}
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
                        <label className="block text-xs font-medium text-[#6E7B8B]">Nom complet</label>
                        <input
                          type="text"
                          defaultValue={selectedUser?.name ?? ''}
                          className="w-full rounded-lg border border-[#E0E6ED] px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB]"
                          placeholder="Ex : Julie Martin"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-[#6E7B8B]">Email</label>
                        <input
                          type="email"
                          defaultValue={selectedUser?.email ?? ''}
                          className="w-full rounded-lg border border-[#E0E6ED] px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB]"
                          placeholder="Ex : nom@entreprise.com"
                        />
                      </div>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-[#9EABB8]">
                      Rôle & permissions
                    </h3>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-[#6E7B8B]">Rôle</label>
                        <select
                          defaultValue={selectedUser?.role ?? 'Utilisateur'}
                          className="w-full rounded-lg border border-[#E0E6ED] bg-white px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB]"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Manager">Manager</option>
                          <option value="Utilisateur">Utilisateur</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-[#6E7B8B]">Permissions rapides (mock) :</p>
                        <div className="space-y-1.5 text-xs text-[#4B5563]">
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="h-3.5 w-3.5 rounded border-[#CBD5E1]" />
                            Accès aux réservations
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="h-3.5 w-3.5 rounded border-[#CBD5E1]" />
                            Gestion des biens
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="h-3.5 w-3.5 rounded border-[#CBD5E1]" />
                            Administration (facturation, paramètres…)
                          </label>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-[#9EABB8]">
                      Statut & sécurité
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-xl border border-[#E0E6ED] bg-[#F9FBFF] px-3 py-2.5">
                        <div>
                          <p className="text-xs font-medium text-[#222B45]">Compte actif</p>
                          <p className="text-[11px] text-[#9EABB8]">
                            Active ou désactive l’accès à la plateforme.
                          </p>
                        </div>
                        <button
                          type="button"
                          className="relative inline-flex h-5 w-9 items-center rounded-full bg-[#22C55E]"
                        >
                          <span className="inline-block h-4 w-4 translate-x-4 transform rounded-full bg-white shadow" />
                        </button>
                      </div>

                      <button
                        type="button"
                        className="w-full rounded-lg border border-[#F97373]/40 bg-[#FEF2F2] px-3 py-2 text-xs font-medium text-[#B91C1C] hover:bg-[#FEE2E2]"
                      >
                        Réinitialiser le mot de passe (mock)
                      </button>
                    </div>
                  </section>
                </div>

                <footer className="px-5 py-4 border-t border-[#E0E6ED] flex justify-end gap-2 bg-white">
                  <button
                    type="button"
                    onClick={handleCloseDrawer}
                    className="rounded-lg border border-[#E0E6ED] bg-white px-4 py-2 text-xs font-medium text-[#6E7B8B] hover:bg-[#F4F7FA]"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#1D4ED8]"
                  >
                    Enregistrer (mock)
                  </button>
                </footer>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Users;