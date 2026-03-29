
import React from 'react';

type ButtonCreateProps = {
  label: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
};

const baseClasses =
  'inline-flex items-center justify-center rounded-lg bg-[#00A896] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#00897B] transition-colors';

const ButtonCreate: React.FC<ButtonCreateProps> = ({
  label,
  onClick,
  type = 'button',
  className = '',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${className}`.trim()}
    >
      <span className="mr-2 text-lg">+</span>
      {label}
    </button>
  );
};

export default ButtonCreate;