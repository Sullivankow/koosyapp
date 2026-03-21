import { useState, useMemo } from 'react';
import { Facture } from '../models/models';

// Hook personnalisé pour gérer le tri des factures
// Prend en entrée la liste des factures filtrées et retourne les factures triées, l'ordre de tri et le setter
export default function useFactureSearchSort(factures: Facture[]) {
  // État pour l'ordre de tri (ascendant ou descendant)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Tri des factures selon la date d'échéance
  const sortedFactures = useMemo(() => {
    return [...factures].sort((a, b) => {
      const dateA = new Date(a.dateEcheance || new Date()).getTime();
      const dateB = new Date(b.dateEcheance || new Date()).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [factures, sortOrder]);

  // Retourne les factures triées et les outils de tri
  return {
    sortOrder,
    setSortOrder,
    sortedFactures,
  };
}