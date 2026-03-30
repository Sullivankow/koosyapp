
import React from 'react';

// Barre de recherche générique utilisée en haut des listes (biens, users, réservations, etc.).
// Affiche une icône de loupe + un champ texte.
type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
};

const baseClasses =
  'w-full rounded-lg border border-[#E0E6ED] bg-[#F9FBFF] py-2.5 pl-9 pr-3 text-sm text-[#222B45] placeholder:text-[#9EABB8] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]';

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder, className = '' }) => {
  return (
    // Conteneur positionné en relatif pour placer l'icône de recherche à l'intérieur du champ
    <div className={`relative ${className}`.trim()}>
      {/* Icône de loupe à gauche du champ de saisie */}
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#9EABB8] text-sm">
        🔍
      </span>
      {/* Champ de saisie contrôlé par le parent (valeur + onChange) */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={baseClasses}
      />
    </div>
  );
};

export default SearchBar;