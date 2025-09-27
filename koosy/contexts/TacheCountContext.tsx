import React, { createContext, useContext, useState, useCallback } from 'react';
import { getTachesAFaireTotal } from '../utils/api';

interface TacheCountContextType {
  tacheCount: number;
  refreshTacheCount: () => Promise<void>;
  setTacheCount: React.Dispatch<React.SetStateAction<number>>;
}

const TacheCountContext = createContext<TacheCountContextType | undefined>(undefined);

export const TacheCountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tacheCount, setTacheCount] = useState<number>(0);

  const refreshTacheCount = useCallback(async () => {
    try {
      const data = await getTachesAFaireTotal();
      setTacheCount(data.total ?? 0);
    } catch {
      setTacheCount(0);
    }
  }, []);

  React.useEffect(() => {
    refreshTacheCount();
  }, [refreshTacheCount]);

  return (
    <TacheCountContext.Provider value={{ tacheCount, refreshTacheCount, setTacheCount }}>
      {children}
    </TacheCountContext.Provider>
  );
};

export const useTacheCount = () => {
  const context = useContext(TacheCountContext);
  if (!context) throw new Error('useTacheCount must be used within a TacheCountProvider');
  return context;
};
