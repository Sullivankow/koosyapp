
// Section de filtres générique utilisée sur les pages de liste (biens, users, réservations, etc.)
// Regroupe la barre de recherche, les champs de filtre (SelectField, inputs...) et le résumé + bouton reset.
import React from 'react';
import SearchBar from '../../components/searchBar';

// Props attendues par la section de filtres
interface FiltersSectionProps {
  // Valeur actuelle du champ de recherche
  searchValue: string;
  // Callback à appeler lorsqu'on modifie la recherche
  onSearchChange: (value: string) => void;
  // Placeholder affiché dans la SearchBar
  searchPlaceholder: string;
  // Contenu des filtres détaillés (SelectField, inputs, etc.)
  children: React.ReactNode;
  // Texte de résumé affiché sous les filtres (ex : "X éléments affichés")
  summary: string;
  // Fonction appelée lorsqu'on clique sur "Réinitialiser les filtres"
  onReset: () => void;
  // Permet de surcharger la grille de disposition des filtres (nb de colonnes, etc.)
  filtersClassName?: string;
}

const FiltersSection: React.FC<FiltersSectionProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  children,
  summary,
  onReset,
  filtersClassName,
}) => {
  return (
    // Conteneur visuel principal de la zone de filtres
    <section className="rounded-2xl bg-white border border-[#E0E6ED] p-4 sm:p-5 space-y-4">
      {/* Barre de recherche commune aux pages de liste */}
      <SearchBar
        value={searchValue}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
      />

      {/* Ligne / grille de filtres détaillés (SelectField, autres inputs...) */}
      <div className={filtersClassName ?? 'grid gap-3 sm:grid-cols-3 text-sm'}>{children}</div>

      {/* Résumé du filtrage + bouton pour tout réinitialiser */}
      <div className="flex flex-col items-start justify-end gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-[#9EABB8]">{summary}</p>
        <button
          type="button"
          onClick={onReset}
          className="text-[11px] font-medium text-[#00A896] hover:text-[#00897B]"
        >
          Réinitialiser les filtres
        </button>
      </div>
    </section>
  );
};

export default FiltersSection;