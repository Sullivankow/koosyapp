

import { useCallback, useState } from 'react';

// Hook générique pour gérer l'ouverture / fermeture de la sidebar
// dans toutes les pages de l'admin. Permet d'éviter de répéter
// const [sidebarOpen, setSidebarOpen] = useState(false) partout.
export function useSidebar(initialOpen = false) {
  const [sidebarOpen, setSidebarOpen] = useState(initialOpen);

  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  return { sidebarOpen, openSidebar, closeSidebar, toggleSidebar };
}

export default useSidebar;