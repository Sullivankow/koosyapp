import { useState, useMemo } from 'react';
import { Bien } from '../models/models';

// Hook personnalisé pour gérer le tri des biens
// Prend en entrée la liste des biens filtrés et retourne les biens triés, l'ordre de tri et le setter
export default function useBiensSearchSort(biens: Bien[]) {
	// État pour l'ordre de tri (ascendant ou descendant)
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

	// Tri des biens selon la date de création
	const sortedBiens = useMemo(() => {
		return [...biens].sort((a, b) => {
			const dateA = new Date(a.dateCreation || new Date()).getTime();
			const dateB = new Date(b.dateCreation || new Date()).getTime();
			return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
		});
	}, [biens, sortOrder]);

	// Retourne les biens triés et les outils de tri
	return {
		sortOrder,
		setSortOrder,
		sortedBiens,
	};
}
