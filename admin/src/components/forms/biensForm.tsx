
// Formulaire réutilisable pour éditer les informations d'un bien côté admin.
// Utilisé dans le drawer de la page `biens.tsx` pour modifier nom, adresse, type, superficie, pièces et statut.
import React from 'react';

// Props contrôlées par la page parente (pas de logique métier ici)
interface BiensEditFormProps {
  formError: string | null;
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

const BiensForm: React.FC<BiensEditFormProps> = ({
  formError,
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
    // Bloc principal du formulaire d'édition de bien
    <section className="space-y-4 mt-2">
      {/* Message d'erreur global du formulaire (validation côté page parente) */}
      {formError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-[#6E7B8B]">
            Nom du bien
          </label>
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

        {/* Ligne avec type de bien, superficie et nombre de pièces */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#6E7B8B]">Type</label>
            <select
              value={formType}
              onChange={(e) =>
                onChangeType(
                  e.target.value as 'Appartement' | 'Maison' | 'Studio' | 'Chambre' | '',
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
            <label className="block text-xs font-medium text-[#6E7B8B]">
              Superficie (m²)
            </label>
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

        {/* Sélecteur de statut (disponible / occupé / travaux) */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-[#6E7B8B]">Statut</label>
          <select
            value={formStatut}
            onChange={(e) =>
              onChangeStatut(e.target.value as 'disponible' | 'occupé' | 'travaux')
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

export default BiensForm;