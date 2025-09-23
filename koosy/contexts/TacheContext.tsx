import React, { createContext, useContext, useState, useCallback } from 'react';

interface TacheContextType {
  lastTacheAdded: number;
  signalTacheAdded: () => void;
}

const TacheContext = createContext<TacheContextType | undefined>(undefined);

export const TacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

export const useTache = () => {
  const context = useContext(TacheContext);
  if (!context) throw new Error('useTache must be used within a TacheProvider');
  return context;
};
