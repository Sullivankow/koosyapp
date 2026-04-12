import React, { createContext, useContext, useState, useCallback } from 'react';
import { getBiensCount } from '../utils/bienApi';

// Type décrivant les données et fonctions exposées par le contexte
interface BienCountContextType {
  // Nombre total de biens connus côté API
  biensCount: number;
  // Fonction pour rafraîchir le nombre de biens depuis l'API
  refreshBiensCount: () => Promise<void>;
  // Setter direct pour permettre une mise à jour manuelle du compteur
  setBiensCount: React.Dispatch<React.SetStateAction<number>>;
  // Compteur d'événements "bien ajouté" (utile pour déclencher des effets)
  lastBienAdded: number;
  // Fonction à appeler lorsqu'un bien est ajouté pour incrémenter le compteur
  signalBienAdded: () => void;
}

// Création du contexte, initialisé à undefined pour forcer l'utilisation via le provider
const BienCountContext = createContext<BienCountContextType | undefined>(undefined);

// Provider englobant l'application ou les parties qui ont besoin du nombre de biens
export const BienCountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // État local pour stocker le nombre de biens
  const [biensCount, setBiensCount] = useState<number>(0);
  // État servant de compteur d'ajouts de biens (permet de réagir à chaque ajout)
  const [lastBienAdded, setLastBienAdded] = useState<number>(0);

  // Fonction pour signaler l'ajout d'un bien (incrémente simplement le compteur)
  const signalBienAdded = useCallback(() => {
    setLastBienAdded(prev => prev + 1);
  }, []);

  // Récupère le nombre de biens auprès de l'API et met à jour l'état
  const refreshBiensCount = useCallback(async () => {
    try {
      const data = await getBiensCount();
      setBiensCount(data.total ?? 0);
    } catch {
      // En cas d'erreur API, on remet le compteur à 0 pour éviter des valeurs incohérentes
      setBiensCount(0);
    }
  }, []);

  // Chargement initial du nombre de biens au montage du provider
  React.useEffect(() => {
    refreshBiensCount();
  }, [refreshBiensCount]);

  return (
    <BienCountContext.Provider
      value={{ biensCount, refreshBiensCount, setBiensCount, lastBienAdded, signalBienAdded }}
    >
      {children}
    </BienCountContext.Provider>
  );
};

// Hook personnalisé pour consommer facilement le contexte dans les composants enfants
export const useBienCount = () => {
  const context = useContext(BienCountContext);

  // On force l'utilisation du hook à l'intérieur du provider pour éviter les erreurs silencieuses
  if (!context) {
    throw new Error('useBienCount must be used within a BienCountProvider');
  }

  return context;
};
