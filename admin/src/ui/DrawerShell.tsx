
// Coquille générique de drawer latéral pour l’admin.
// Gère l’overlay, le panneau à droite, le header (titre + sous-titre) et un footer optionnel.
import React from 'react';

interface DrawerShellProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const DrawerShell: React.FC<DrawerShellProps> = ({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Overlay plein écran pour fermer le drawer en cliquant à l'extérieur */}
      <div className="fixed inset-0 bg-black/20" onClick={onClose} />

      {/* Panneau latéral droit */}
      <div className="relative ml-auto h-full w-full max-w-md bg-white shadow-xl border-l border-[#E0E6ED] flex flex-col">
        <header className="px-5 py-4 border-b border-[#E0E6ED] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#222B45]">{title}</h2>
            {subtitle && (
              <p className="text-[11px] text-[#9EABB8]">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-[#9EABB8] hover:bg-[#F4F7FA]"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 text-sm">{children}</div>

        {footer && (
          <footer className="px-5 py-4 border-t border-[#E0E6ED] flex justify-end gap-2 bg-white">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};

export default DrawerShell;