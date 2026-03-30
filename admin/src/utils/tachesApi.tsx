// Fonctions d'appel API liées aux tâches
import { getJson } from './api';
import type { BackendTache } from '../models/models';

// Nombre total de tâches « à faire » (toutes conciergeries confondues, vue admin)
export async function fetchTachesAFaireTotal(): Promise<number | null> {
	try {
		const taches = await getJson<BackendTache[]>('/taches/admin');
		// On compte uniquement les tâches dont le statut est "à faire"
		return taches.filter((t) => t.statut === 'à faire').length;
	} catch (e) {
		console.error('Erreur lors de la récupération du nombre de tâches à faire :', e);
		return null;
	}
}

// Liste complète des tâches (vue admin)
export async function fetchTachesAdminList(): Promise<BackendTache[] | null> {
	try {
		return await getJson<BackendTache[]>('/taches/admin');
	} catch (e) {
		console.error('Erreur lors de la récupération de la liste totale des tâches (admin) :', e);
		return null;
	}
}

// Alias pour compatibilité : liste des tâches
export async function fetchTachesList(): Promise<BackendTache[] | null> {
	return fetchTachesAdminList();
}

export default {
	fetchTachesAFaireTotal,
	fetchTachesAdminList,
	fetchTachesList,
};

