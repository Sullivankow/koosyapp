


import { API_BASE_URL, buildHeaders, getJson } from './api';
import type { BackendProprietaire } from '../models/models';

// Liste complète des propriétaires
export async function fetchProprietairesList(): Promise<BackendProprietaire[] | null> {
  try {
    return await getJson<BackendProprietaire[]>('/proprietaire');
  } catch (e) {
    console.error('Erreur lors de la récupération de la liste des propriétaires :', e);
    return null;
  }
}

// Nombre total de propriétaires
export async function fetchProprietairesTotal(): Promise<number | null> {
  try {
    const proprietaires = await getJson<BackendProprietaire[]>('/proprietaire');
    return proprietaires.length;
  } catch (e) {
    console.error('Erreur lors de la récupération des propriétaires :', e);
    return null;
  }
}