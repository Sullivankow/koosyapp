// Fonctions d'appel API liées aux factures
import { getJson } from './api';

// Nombre total de factures accessibles (compte côté front en attendant un endpoint dédié)
export async function fetchFacturesTotal(): Promise<number | null> {
	try {
		const factures = await getJson<any[]>('/facture');
		return factures.length;
	} catch (e) {
		console.error('Erreur lors de la récupération des factures :', e);
		return null;
	}
}

// Liste complète des factures
export async function fetchFacturesList(): Promise<any[] | null> {
	try {
		return await getJson<any[]>('/facture');
	} catch (e) {
		console.error('Erreur lors de la récupération de la liste des factures :', e);
		return null;
	}
}

export default {
	fetchFacturesTotal,
	fetchFacturesList,
};

