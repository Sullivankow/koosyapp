import React from 'react';

// Petit composant utilitaire pour afficher un label + <select> avec le style Koosy.
// Utilisé pour tous les filtres de type liste déroulante dans les pages admin.
export interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  containerClassName?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  containerClassName,
  children,
  className,
  ...selectProps
}) => {
  return (
    // Conteneur du label + champ select
    <div className={containerClassName ?? 'space-y-1'}>
      <label className="block text-xs font-medium text-[#6E7B8B]">{label}</label>
      <select
        className={
          className ??
          'w-full rounded-lg border border-[#E0E6ED] bg-white px-3 py-2 text-sm text-[#222B45] focus:outline-none focus:ring-2 focus:ring-[#00A896]/40 focus:border-[#00A896]'
        }
        {...selectProps}
      >
        {children}
      </select>
    </div>
  );
};

export default SelectField;
