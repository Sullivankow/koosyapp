import React, { createContext, useContext, useState, useCallback } from 'react';

// Type décrivant les données exposées par le contexte de rafraîchissement global
interface GlobalRefreshContextType {
  // Compteur de rafraîchissements global (incrémenté à chaque signal)
  lastRefresh: number;
  // Fonction pour signaler qu'un rafraîchissement global doit avoir lieu
  signalRefresh: () => void;
}

// Contexte initialisé à undefined pour imposer l'utilisation via le provider
const GlobalRefreshContext = createContext<GlobalRefreshContextType | undefined>(undefined);

// Provider englobant les composants qui doivent réagir à un "refresh" global
export const GlobalRefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Compteur de rafraîchissements ; sa valeur peut être utilisée comme dépendance dans des hooks
  const [lastRefresh, setLastRefresh] = useState<number>(0);

  // Incrémente le compteur pour signaler un nouveau rafraîchissement
  const signalRefresh = useCallback(() => {
    setLastRefresh(prev => prev + 1);
  }, []);

  return (
    <GlobalRefreshContext.Provider value={{ lastRefresh, signalRefresh }}>
      {children}
    </GlobalRefreshContext.Provider>
  );
};

// Hook personnalisé pour consommer facilement le contexte
export const useGlobalRefresh = (): GlobalRefreshContextType => {
  const context = useContext(GlobalRefreshContext);

  if (!context) {
    throw new Error('useGlobalRefresh must be used within a GlobalRefreshProvider');
  }

  return context;
};
