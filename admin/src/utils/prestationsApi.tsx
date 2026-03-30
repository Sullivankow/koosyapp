
import { getJson } from './api';
import type { BackendPrestationsList } from '../models/models';

// Récupère la liste paginée des prestations (admin)
export async function fetchPrestationsList(page = 1, limit = 20, bienId?: number): Promise<BackendPrestationsList> {
  let url = `/prestations?page=${page}&limit=${limit}`;
  if (bienId) url += `&bienId=${bienId}`;
  return await getJson<BackendPrestationsList>(url);
}