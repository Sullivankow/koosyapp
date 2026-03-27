import React, { createContext, useContext, useState, useCallback } from 'react';

// Type décrivant les données et fonctions exposées par le contexte de rafraîchissement des réservations
interface ReservationRefreshContextType {
  // Compteur d'événements "réservation ajoutée" (utile pour déclencher des effets ou rechargements)
  lastReservationAdded: number;
  // Fonction à appeler lorsqu'une nouvelle réservation est ajoutée
  signalReservationAdded: () => void;
}

// Contexte initialisé à undefined pour forcer l'utilisation via le provider
const ReservationRefreshContext = createContext<ReservationRefreshContextType | undefined>(undefined);

// Provider englobant les composants qui doivent réagir à l'ajout d'une réservation
export const ReservationRefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // État interne servant de déclencheur : il est incrémenté à chaque nouvelle réservation
  const [lastReservationAdded, setLastReservationAdded] = useState<number>(0);

  // Fonction à appeler pour signaler l'ajout d'une réservation
  const signalReservationAdded = useCallback(() => {
    setLastReservationAdded(prev => prev + 1);
  }, []);

  return (
    <ReservationRefreshContext.Provider value={{ lastReservationAdded, signalReservationAdded }}>
      {children}
    </ReservationRefreshContext.Provider>
  );
};

// Hook personnalisé pour consommer facilement le contexte dans les composants enfants
export const useReservationRefresh = () => {
  const context = useContext(ReservationRefreshContext);

  // On impose que le hook soit utilisé à l'intérieur du provider
  if (!context) {
    throw new Error('useReservationRefresh must be used within a ReservationRefreshProvider');
  }

  return context;
};
