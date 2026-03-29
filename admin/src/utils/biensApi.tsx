
// Fonctions d'appel API liées aux biens
import { getJson } from './api';
import type { BackendBien } from '../models/models';

// Liste des biens de l'utilisateur connecté (vue conciergerie)
export async function fetchBiensList(): Promise<BackendBien[] | null> {
  try {
    return await getJson<BackendBien[]>('/biens');
  } catch (e) {
    console.error('Erreur lors de la récupération de la liste des biens :', e);
    return null;
  }
}

// Liste complète de tous les biens (vue admin)
export async function fetchBiensAdminList(): Promise<BackendBien[] | null> {
  try {
    return await getJson<BackendBien[]>('/biens/admin');
  } catch (e) {
    console.error('Erreur lors de la récupération de la liste complète des biens (admin) :', e);
    return null;
  }
}

// Nombre total de biens en base (utilise la liste admin)
export async function fetchBiensTotal(): Promise<number | null> {
  try {
    const biens = await fetchBiensAdminList();
    return biens ? biens.length : 0;
  } catch (e) {
    console.error('Erreur lors de la récupération du nombre total de biens :', e);
    return null;
  }
}

export default {
  fetchBiensList,
  fetchBiensAdminList,
  fetchBiensTotal,
};