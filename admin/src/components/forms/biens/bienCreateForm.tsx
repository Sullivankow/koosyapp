
// Formulaire de création d'un bien côté admin.
// Regroupe la sélection de l'utilisateur (conciergerie) et les champs du bien.
import React from 'react';

type BienCreateUser = {
  id: number;
  prenom: string | null;
  nom: string | null;
  email: string;
};

interface BienCreateFormProps {
  formError: string | null;
  users: BienCreateUser[];
  formUserId: number | '';
  onChangeUserId: (value: number | '') => void;
  formNom: string;
  formAdresse: string;
  formType: 'Appartement' | 'Maison' | 'Studio' | 'Chambre' | '';
  formSuperficie: string;
  formPieces: string;
  formStatut: 'disponible' | 'occupé' | 'travaux';
  onChangeNom: (value: string) => void;
  onChangeAdresse: (value: string) => void;
  onChangeType: (value: 'Appartement' | 'Maison' | 'Studio' | 'Chambre' | '') => void;
  onChangeSuperficie: (value: string) => void;
  onChangePieces: (value: string) => void;
  onChangeStatut: (value: 'disponible' | 'occupé' | 'travaux') => void;
}

const BienCreateForm: React.FC<BienCreateFormProps> = ({
  formError,
  users,
  formUserId,
  onChangeUserId,
  formNom,
  formAdresse,
  formType,
  formSuperficie,
  formPieces,
  formStatut,
  onChangeNom,
  onChangeAdresse,
  onChangeType,
  onChangeSuperficie,
  onChangePieces,
  onChangeStatut,
}) => {
  return (
    <section className="space-y-4">
      {formError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
          {formError}
        </div>
      )}

      <div className="space-y-1">
        <label className="block text-xs font-medium text-[#6E7B8B]">
          Utilisateur (conciergerie) concerné
        </label>
        <select
          value={formUserId}
          onChange={(e) =>
            onChangeUserId(e.target.value ? Number(e.target.value) : '')
          }
          className="w-full rounded-lg border border-[#E0E6ED] bg-white px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
        >
          <option value="">Sélectionner un utilisateur</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.prenom} {u.nom} — {u.email}
            </option>
          ))}
        </select>
        {formUserId && (
          <p className="text-[11px] text-[#9EABB8]">
            Le bien sera rattaché à cet utilisateur dans la conciergerie.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-[#6E7B8B]">Nom du bien</label>
          <input
            type="text"
            value={formNom}
            onChange={(e) => onChangeNom(e.target.value)}
            className="w-full rounded-lg border border-[#E0E6ED] bg-white px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
            placeholder="Ex : Appartement T2 centre-ville"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-[#6E7B8B]">Adresse</label>
          <input
            type="text"
            value={formAdresse}
            onChange={(e) => onChangeAdresse(e.target.value)}
            className="w-full rounded-lg border border-[#E0E6ED] bg-white px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
            placeholder="Adresse complète du bien"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#6E7B8B]">Type</label>
            <select
              value={formType}
              onChange={(e) =>
                onChangeType(
                  e.target.value as
                    | 'Appartement'
                    | 'Maison'
                    | 'Studio'
                    | 'Chambre'
                    | '',
                )
              }
              className="w-full rounded-lg border border-[#E0E6ED] bg-white px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
            >
              <option value="">Sélectionner</option>
              <option value="Appartement">Appartement</option>
              <option value="Maison">Maison</option>
              <option value="Studio">Studio</option>
              <option value="Chambre">Chambre</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#6E7B8B]">Superficie (m²)</label>
            <input
              type="number"
              min={0}
              value={formSuperficie}
              onChange={(e) => onChangeSuperficie(e.target.value)}
              className="w-full rounded-lg border border-[#E0E6ED] bg-white px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#6E7B8B]">Pièces</label>
            <input
              type="number"
              min={0}
              value={formPieces}
              onChange={(e) => onChangePieces(e.target.value)}
              className="w-full rounded-lg border border-[#E0E6ED] bg-white px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-[#6E7B8B]">Statut</label>
          <select
            value={formStatut}
            onChange={(e) =>
              onChangeStatut(
                e.target.value as 'disponible' | 'occupé' | 'travaux',
              )
            }
            className="w-full rounded-lg border border-[#E0E6ED] bg-white px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]"
          >
            <option value="disponible">Disponible</option>
            <option value="occupé">Occupé</option>
            <option value="travaux">En travaux</option>
          </select>
        </div>
      </div>
    </section>
  );
};

export default BienCreateForm;