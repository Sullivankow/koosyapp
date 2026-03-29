// Page de gestion des utilisateurs
// Liste les comptes, permet de filtrer et d'ouvrir un panneau de détails (branché sur l'API)
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/sidebar';
import SearchBar from '../components/searchBar';
import ButtonCreate from '../ui/buttonCreate';
import { fetchUsersList, createUser } from '../utils/usersApi';
import type { BackendUser } from '../models/models';

// Type représentant un utilisateur pour l'affichage dans cette page
type User = {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Utilisateur';
  status: 'Actif' | 'Inactif';
  lastLogin: string;
};

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
  // États du formulaire de création/édition
  const [formNom, setFormNom] = useState('');
  const [formPrenom, setFormPrenom] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<'Admin' | 'Utilisateur'>('Utilisateur');
  const [formPassword, setFormPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  // Liste récupérée depuis l'API backend
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiUsers = await fetchUsersList();
        if (!apiUsers) {
          setUsers([]);
          return;
        }

        const mapped: User[] = apiUsers.map((u: BackendUser) => ({
          id: u.id,
          name: `${u.prenom ?? ''} ${u.nom ?? ''}`.trim() || u.email,
          email: u.email,
          // On mappe les rôles back vers les rôles visibles dans le backoffice
          role: u.role === 'admin' ? 'Admin' : 'Utilisateur',
          status: 'Actif',
          lastLogin: '—',
        }));

        setUsers(mapped);
      } catch (e) {
        console.error('Erreur lors du chargement des utilisateurs', e);
        setError("Impossible de charger la liste des utilisateurs.");
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  // Applique les filtres (recherche, rôle, statut) sur la liste provenant de l'API
  const filteredUsers = users.filter((user) => {
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
    if (user) {
      const [prenom = '', nom = ''] = user.name.split(' ');
      setFormPrenom(prenom);
      setFormNom(nom);
      setFormEmail(user.email);
      setFormRole(user.role);
    } else {
      setFormPrenom('');
      setFormNom('');
      setFormEmail('');
      setFormRole('Utilisateur');
    }
    setFormPassword('');
    setFormError(null);
    setDrawerOpen(true);
  };

  // Ferme le drawer et réinitialise l'utilisateur sélectionné
  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedUser(null);
    setFormPrenom('');
    setFormNom('');
    setFormEmail('');
    setFormPassword('');
    setFormError(null);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setFormError(null);

      if (!formEmail || !formPassword || !formNom || !formPrenom) {
        setFormError('Veuillez remplir tous les champs obligatoires.');
        return;
      }

      // Création uniquement pour l'instant
      await createUser({
        email: formEmail,
        password: formPassword,
        nom: formNom,
        prenom: formPrenom,
        role: formRole === 'Admin' ? 'admin' : 'user',
      });

      // Recharge la liste
      const apiUsers = await fetchUsersList();
      const mapped: User[] = (apiUsers ?? []).map((u: BackendUser) => ({
        id: u.id,
        name: `${u.prenom ?? ''} ${u.nom ?? ''}`.trim() || u.email,
        email: u.email,
        role: u.role === 'admin' ? 'Admin' : 'Utilisateur',
        status: 'Actif',
        lastLogin: '—',
      }));
      setUsers(mapped);

      handleCloseDrawer();
    } catch (e) {
      console.error('Erreur lors de la création de l\'utilisateur', e);
      setFormError("Impossible de créer l'utilisateur.");
    } finally {
      setSaving(false);
    }
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
            <ButtonCreate label="Nouvel utilisateur" onClick={() => handleOpenDrawer()} />
          </div>

          {/* Filtres & recherche */}
          <section className="rounded-2xl bg-white border border-[#E0E6ED] p-4 sm:p-5 space-y-4">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Rechercher par nom, email…"
            />

            <div className="grid gap-3 sm:grid-cols-3 text-sm">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#6E7B8B]">Rôle</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="w-full rounded-lg border border-[#E0E6ED] bg-white px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
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
                  className="w-full rounded-lg border border-[#E0E6ED] bg-white px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
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
                  className="text-[11px] font-medium text-[#00A896] hover:text-[#00897B]"
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
              <span className="text-[11px] text-[#9EABB8]">Données chargées depuis l’API</span>
            </div>
            {loading ? (
              <div className="p-8 text-center text-sm text-[#6E7B8B]">
                Chargement des utilisateurs…
              </div>
            ) : error ? (
              <div className="p-8 text-center text-sm text-[#B91C1C]">
                <p className="mb-2 font-medium">{error}</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setRoleFilter('Tous');
                    setStatusFilter('Tous');
                  }}
                  className="rounded-lg border border-[#E0E6ED] bg-[#F9FBFF] px-3 py-1.5 text-xs font-medium text-[#00A896] hover:bg-[#D1FAF5]"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#6E7B8B]">
                <p className="mb-2 font-medium">Aucun utilisateur ne correspond à vos filtres.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setRoleFilter('Tous');
                    setStatusFilter('Tous');
                  }}
                  className="rounded-lg border border-[#E0E6ED] bg-[#F9FBFF] px-3 py-1.5 text-xs font-medium text-[#00A896] hover:bg-[#D1FAF5]"
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
                  className="rounded-full border border-transparent px-2 py-1 text-[#00A896] hover:bg-[#D1FAF5]"
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
                        <label className="block text-xs font-medium text-[#6E7B8B]">Nom</label>
                        <input
                          type="text"
                          value={formNom}
                          onChange={(e) => setFormNom(e.target.value)}
                  className="w-full rounded-lg border border-[#E0E6ED] px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
                          placeholder="Ex : Martin"
                />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-[#6E7B8B]">Prénom</label>
                        <input
                          type="text"
                          value={formPrenom}
                          onChange={(e) => setFormPrenom(e.target.value)}
                          className="w-full rounded-lg border border-[#E0E6ED] px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
                          placeholder="Ex : Julie"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-[#6E7B8B]">Email</label>
                        <input
                  type="email"
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full rounded-lg border border-[#E0E6ED] px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
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
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as 'Admin' | 'Utilisateur')}
                  className="w-full rounded-lg border border-[#E0E6ED] bg-white px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
                >
                          <option value="Admin">Admin</option>
                          <option value="Utilisateur">Utilisateur</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-[#6E7B8B]">Mot de passe initial</label>
                        <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full rounded-lg border border-[#E0E6ED] px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
                  placeholder="Mot de passe temporaire"
                />
                        <p className="text-[11px] text-[#9EABB8]">
                          L&apos;utilisateur pourra le changer plus tard depuis son espace.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Bloc Statut & sécurité retiré pour simplifier la création */}
                </div>

                <footer className="px-5 py-4 border-t border-[#E0E6ED] flex justify-end gap-2 bg-white">
                  <button
                    type="button"
                    onClick={handleCloseDrawer}
                    className="rounded-lg border border-[#E0E6ED] bg-white px-4 py-2 text-xs font-medium text-[#6E7B8B] hover:bg-[#F4F7FA]"
                  >
                    Annuler
                  </button>
                  {formError && (
              <p className="flex-1 text-xs text-[#B91C1C] self-center text-left">{formError}</p>
            )}
                  <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-lg bg-[#00A896] px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#00897B] disabled:opacity-60 disabled:cursor-not-allowed"
          >
                    {saving ? 'Enregistrement…' : 'Enregistrer'}
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