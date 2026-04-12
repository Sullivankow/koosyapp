import React, { createContext, useContext, useState, useCallback } from 'react';
import { getTachesAFaireTotal } from '../utils/tachesApi';

// Type décrivant les données et fonctions exposées par le contexte du nombre de tâches
interface TacheCountContextType {
  // Nombre total de tâches à faire (récupéré depuis l'API)
  tacheCount: number;
  // Fonction pour rafraîchir ce nombre en appelant l'API
  refreshTacheCount: () => Promise<void>;
  // Setter direct pour permettre une mise à jour manuelle du compteur
  setTacheCount: React.Dispatch<React.SetStateAction<number>>;
}

// Contexte initialisé à undefined pour imposer l'utilisation via TacheCountProvider
const TacheCountContext = createContext<TacheCountContextType | undefined>(undefined);

// Provider qui gère le compteur de tâches et le met à disposition du reste de l'application
export const TacheCountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // État local pour stocker le nombre de tâches à faire
  const [tacheCount, setTacheCount] = useState<number>(0);

  // Récupère le nombre de tâches à faire auprès de l'API et met à jour l'état
  const refreshTacheCount = useCallback(async () => {
    try {
      const data = await getTachesAFaireTotal();
      setTacheCount(data.total ?? 0);
    } catch {
      // En cas d'erreur API, on remet le compteur à 0 pour éviter des valeurs incohérentes
      setTacheCount(0);
    }
  }, []);

  // Chargement initial du compteur au montage du provider
  React.useEffect(() => {
    refreshTacheCount();
  }, [refreshTacheCount]);

  return (
    <TacheCountContext.Provider value={{ tacheCount, refreshTacheCount, setTacheCount }}>
      {children}
    </TacheCountContext.Provider>
  );
};

// Hook personnalisé pour consommer facilement le contexte dans les composants enfants
export const useTacheCount = () => {
  const context = useContext(TacheCountContext);

  // On impose que le hook soit utilisé à l'intérieur du provider
  if (!context) {
    throw new Error('useTacheCount must be used within a TacheCountProvider');
  }

  return context;
};
