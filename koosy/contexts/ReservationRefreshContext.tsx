import React, { createContext, useContext, useState, useCallback } from 'react';

interface ReservationRefreshContextType {
  lastReservationAdded: number;
  signalReservationAdded: () => void;
}

const ReservationRefreshContext = createContext<ReservationRefreshContextType | undefined>(undefined);

export const ReservationRefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastReservationAdded, setLastReservationAdded] = useState<number>(0);
  const signalReservationAdded = useCallback(() => {
    setLastReservationAdded(prev => prev + 1);
  }, []);
  return (
    <ReservationRefreshContext.Provider value={{ lastReservationAdded, signalReservationAdded }}>
      {children}
    </ReservationRefreshContext.Provider>
  );
};

export const useReservationRefresh = () => {
  const context = useContext(ReservationRefreshContext);
  if (!context) throw new Error('useReservationRefresh must be used within a ReservationRefreshProvider');
  return context;
};
