import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { getPrestationsTermineesCount } from '../utils/prestationsApi';

// Contexte pour partager le nombre de prestations terminées dans l'application
const PrestationsCountContext = createContext({
  // Nombre de prestations marquées comme terminées
  prestationsTerminees: 0,
  // Fonction pour rafraîchir ce nombre en appelant l'API
  refreshPrestationsTerminees: () => {},
});

// Provider qui encapsule les composants ayant besoin du compteur de prestations terminées
export const PrestationsCountProvider = ({ children }: { children: ReactNode }) => {
  // État local contenant le nombre de prestations terminées
  const [prestationsTerminees, setPrestationsTerminees] = useState(0);

  // Fonction mémoïsée qui récupère la valeur auprès de l'API et met à jour l'état
  const refreshPrestationsTerminees = useCallback(() => {
    getPrestationsTermineesCount().then(setPrestationsTerminees);
  }, []);

  // Chargement initial du compteur au montage du provider
  useEffect(() => {
    refreshPrestationsTerminees();
  }, [refreshPrestationsTerminees]);

  return (
    <PrestationsCountContext.Provider value={{ prestationsTerminees, refreshPrestationsTerminees }}>
      {children}
    </PrestationsCountContext.Provider>
  );
};

// Hook personnalisé pour consommer facilement le contexte dans les composants enfants
export const usePrestationsCount = () => useContext(PrestationsCountContext);
