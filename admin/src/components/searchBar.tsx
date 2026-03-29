
import React from 'react';

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
    <div className={`relative ${className}`.trim()}>
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#9EABB8] text-sm">
        🔍
      </span>
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