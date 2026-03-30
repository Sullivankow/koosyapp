
// Formulaire latéral (drawer) pour créer ou modifier un utilisateur Koosy côté admin.
// Toute la logique (chargement, validation, appel API) reste dans la page `users.tsx`.
import React from 'react';
import type { User } from '../../pages/users';

// Décrit les props nécessaires pour piloter le formulaire depuis la page
interface UsersFormProps {
  selectedUser: User | null;
  formNom: string;
  formPrenom: string;
  formEmail: string;
  formRole: 'Admin' | 'Utilisateur';
  formPassword: string;
  formError: string | null;
  saving: boolean;
  onChangeNom: (value: string) => void;
  onChangePrenom: (value: string) => void;
  onChangeEmail: (value: string) => void;
  onChangeRole: (value: 'Admin' | 'Utilisateur') => void;
  onChangePassword: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const UsersForm: React.FC<UsersFormProps> = ({
  selectedUser,
  formNom,
  formPrenom,
  formEmail,
  formRole,
  formPassword,
  formError,
  saving,
  onChangeNom,
  onChangePrenom,
  onChangeEmail,
  onChangeRole,
  onChangePassword,
  onSubmit,
  onCancel,
}) => {
  return (
    // Conteneur du panneau latéral (drawer)
    <div className="relative ml-auto h-full w-full max-w-md bg-white shadow-xl border-l border-[#E0E6ED] flex flex-col">
      {/* En-tête du formulaire : titre + bouton de fermeture */}
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
          onClick={onCancel}
          className="rounded-full p-1.5 text-[#9EABB8] hover:bg-[#F4F7FA]"
        >
          ✕
        </button>
      </header>
      {/* Corps du formulaire : champs contrôlés (nom, prénom, email, rôle, mot de passe) */}
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
                onChange={(e) => onChangeNom(e.target.value)}
                className="w-full rounded-lg border border-[#E0E6ED] px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
                placeholder="Ex : Martin"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#6E7B8B]">Prénom</label>
              <input
                type="text"
                value={formPrenom}
                onChange={(e) => onChangePrenom(e.target.value)}
                className="w-full rounded-lg border border-[#E0E6ED] px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
                placeholder="Ex : Julie"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#6E7B8B]">Email</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => onChangeEmail(e.target.value)}
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
                onChange={(e) => onChangeRole(e.target.value as 'Admin' | 'Utilisateur')}
                className="w-full rounded-lg border border-[#E0E6ED] bg-white px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
              >
                <option value="Admin">Admin</option>
                <option value="Utilisateur">Utilisateur</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#6E7B8B]">Mot de passe</label>
              <input
                type="password"
                value={formPassword}
                onChange={(e) => onChangePassword(e.target.value)}
                className="w-full rounded-lg border border-[#E0E6ED] px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
                placeholder={
                  selectedUser
                    ? 'Laisser vide pour ne pas changer'
                    : 'Mot de passe temporaire'
                }
              />
              <p className="text-[11px] text-[#9EABB8]">
                {selectedUser
                  ? 'Laisser vide pour conserver le mot de passe actuel.'
                  : "L'utilisateur pourra le changer plus tard depuis son espace."}
              </p>
            </div>
          </div>
        </section>
        {/* Bloc Statut & sécurité retiré pour simplifier la création dans cette première version */}
      </div>
      {/* Pied du formulaire : actions Annuler / Enregistrer + affichage d'erreur éventuelle */}
      <footer className="px-5 py-4 border-t border-[#E0E6ED] flex justify-end gap-2 bg-white">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[#E0E6ED] bg-white px-4 py-2 text-xs font-medium text-[#6E7B8B] hover:bg-[#F4F7FA]"
        >
          Annuler
        </button>
        {formError && (
          <p className="flex-1 text-xs text-[#B91C1C] self-center text-left">{formError}</p>
        )}
        <button
          type="button"
          onClick={onSubmit}
          disabled={saving}
          className="rounded-lg bg-[#00A896] px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#00897B] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </footer>
    </div>
  );
};

export default UsersForm;