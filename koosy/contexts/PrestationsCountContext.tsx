import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { getPrestationsTermineesCount } from '../utils/api';

const PrestationsCountContext = createContext({
  prestationsTerminees: 0,
  refreshPrestationsTerminees: () => {},
});

export const PrestationsCountProvider = ({ children }: { children: ReactNode }) => {
  const [prestationsTerminees, setPrestationsTerminees] = useState(0);

  const refreshPrestationsTerminees = useCallback(() => {
    getPrestationsTermineesCount().then(setPrestationsTerminees);
  }, []);

  useEffect(() => {
    refreshPrestationsTerminees();
  }, [refreshPrestationsTerminees]);

  return (
    <PrestationsCountContext.Provider value={{ prestationsTerminees, refreshPrestationsTerminees }}>
      {children}
    </PrestationsCountContext.Provider>
  );
};

export const usePrestationsCount = () => useContext(PrestationsCountContext);
