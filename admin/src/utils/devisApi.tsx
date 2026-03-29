// Fonctions d'appel API liées aux devis
import { getJson } from './api';

// Nombre total de devis accessibles (compte côté front en attendant un endpoint dédié)
export async function fetchDevisTotal(): Promise<number | null> {
	try {
		const devis = await getJson<any[]>('/devis');
		return devis.length;
	} catch (e) {
		console.error('Erreur lors de la récupération des devis :', e);
		return null;
	}
}

// Liste complète des devis
export async function fetchDevisList(): Promise<any[] | null> {
	try {
		return await getJson<any[]>('/devis');
	} catch (e) {
		console.error('Erreur lors de la récupération de la liste des devis :', e);
		return null;
	}
}

export default {
	fetchDevisTotal,
	fetchDevisList,
};

