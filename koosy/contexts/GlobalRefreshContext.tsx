import React, { createContext, useContext, useState, useCallback } from 'react';

interface GlobalRefreshContextType {
  lastRefresh: number;
  signalRefresh: () => void;
}

const GlobalRefreshContext = createContext<GlobalRefreshContextType | undefined>(undefined);

export const GlobalRefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastRefresh, setLastRefresh] = useState<number>(0);
  const signalRefresh = useCallback(() => {
    setLastRefresh(prev => prev + 1);
  }, []);
  return (
    <GlobalRefreshContext.Provider value={{ lastRefresh, signalRefresh }}>
      {children}
    </GlobalRefreshContext.Provider>
  );
};

export const useGlobalRefresh = () => {
  const context = useContext(GlobalRefreshContext);
  if (!context) throw new Error('useGlobalRefresh must be used within a GlobalRefreshProvider');
  return context;
};
