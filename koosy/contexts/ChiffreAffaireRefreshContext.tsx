import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Type décrivant les données du contexte de rafraîchissement du chiffre d'affaires
interface ChiffreAffaireRefreshContextType {
  // Fonction pour déclencher un rafraîchissement du chiffre d'affaires
  signalRefresh: () => void;
  // Clé de rafraîchissement (change à chaque signal pour forcer les effets dépendants)
  refreshKey: number;
}

// Contexte pour signaler le rafraîchissement du chiffre d'affaires
const ChiffreAffaireRefreshContext = createContext<ChiffreAffaireRefreshContextType>({
  signalRefresh: () => {},
  refreshKey: 0,
});

// Provider du contexte
// Typage explicite du paramètre children
export const ChiffreAffaireRefreshProvider = ({ children }: { children: ReactNode }) => {
  // Clé qui change à chaque rafraîchissement
  const [refreshKey, setRefreshKey] = useState(0);

  // Fonction pour déclencher le rafraîchissement
  const signalRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  // Fournit la clé et la fonction à tous les enfants
  return (
    <ChiffreAffaireRefreshContext.Provider value={{ signalRefresh, refreshKey }}>
      {children}
    </ChiffreAffaireRefreshContext.Provider>
  );
};

// Hook pour utiliser le contexte dans les composants
export const useChiffreAffaireRefresh = (): ChiffreAffaireRefreshContextType =>
  useContext(ChiffreAffaireRefreshContext);

// Utilisation :
// - Place le provider autour de ton app ou dashboard
// - Utilise useChiffreAffaireRefresh() dans le hook ou composant pour accéder à signalRefresh et refreshKey
// - Appelle signalRefresh() après chaque changement de statut pour rafraîchir le CA
