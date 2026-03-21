import { useState, useMemo } from 'react';
import { Devis } from '../models/models';

// Hook personnalisé pour gérer le tri des devis
// Prend en entrée la liste des devis filtrés et retourne les devis triés, l'ordre de tri et le setter
export default function useDevisSearchSort(devis: Devis[]) {
	// État pour l'ordre de tri (ascendant ou descendant)
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

	// Tri des devis selon la date de validité
	const sortedDevis = useMemo(() => {
		return [...devis].sort((a, b) => {
			const dateA = new Date(a.dateValidite || new Date()).getTime();
			const dateB = new Date(b.dateValidite || new Date()).getTime();
			return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
		});
	}, [devis, sortOrder]);

	// Retourne les devis triés et les outils de tri
	return {
		sortOrder,
		setSortOrder,
		sortedDevis,
	};
}
