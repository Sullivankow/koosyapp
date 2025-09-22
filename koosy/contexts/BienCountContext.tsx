import React, { createContext, useContext, useState, useCallback } from 'react';
import { getBiensCount } from '../utils/api';

interface BienCountContextType {
  biensCount: number;
  refreshBiensCount: () => Promise<void>;
  setBiensCount: React.Dispatch<React.SetStateAction<number>>;
  lastBienAdded: number;
  signalBienAdded: () => void;
}

const BienCountContext = createContext<BienCountContextType | undefined>(undefined);

export const BienCountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [biensCount, setBiensCount] = useState<number>(0);
  const [lastBienAdded, setLastBienAdded] = useState<number>(0);
  // Fonction pour signaler l'ajout d'un bien
  const signalBienAdded = useCallback(() => {
    setLastBienAdded(prev => prev + 1);
  }, []);

  const refreshBiensCount = useCallback(async () => {
    try {
      const data = await getBiensCount();
      setBiensCount(data.total ?? 0);
    } catch {
      setBiensCount(0);
    }
  }, []);

  React.useEffect(() => {
    refreshBiensCount();
  }, [refreshBiensCount]);

  return (
    <BienCountContext.Provider value={{ biensCount, refreshBiensCount, setBiensCount, lastBienAdded, signalBienAdded }}>
      {children}
    </BienCountContext.Provider>
  );
};

export const useBienCount = () => {
  const context = useContext(BienCountContext);
  if (!context) throw new Error('useBienCount must be used within a BienCountProvider');
  return context;
};
