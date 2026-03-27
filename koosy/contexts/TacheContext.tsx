import React, { createContext, useContext, useState, useCallback } from 'react';

// Type décrivant les données et fonctions exposées par le contexte des tâches
interface TacheContextType {
  // Compteur d'événements "tâche ajoutée" (utile pour déclencher des rechargements/effets)
  lastTacheAdded: number;
  // Fonction à appeler lorsqu'une nouvelle tâche est créée
  signalTacheAdded: () => void;
}

// Contexte initialisé à undefined pour forcer l'utilisation via le TacheProvider
const TacheContext = createContext<TacheContextType | undefined>(undefined);

// Provider englobant les composants qui doivent réagir à l'ajout d'une tâche
export const TacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // État interne servant de compteur : il est incrémenté à chaque nouvelle tâche
  const [lastTacheAdded, setLastTacheAdded] = useState<number>(0);

  // Fonction pour signaler l'ajout d'une tâche
  const signalTacheAdded = useCallback(() => {
    setLastTacheAdded(prev => prev + 1);
  }, []);

  return (
    <TacheContext.Provider value={{ lastTacheAdded, signalTacheAdded }}>
      {children}
    </TacheContext.Provider>
  );
};

// Hook personnalisé pour consommer facilement le contexte dans les composants enfants
export const useTache = () => {
  const context = useContext(TacheContext);

  // On impose que le hook soit utilisé à l'intérieur du provider
  if (!context) {
    throw new Error('useTache must be used within a TacheProvider');
  }

  return context;
};
