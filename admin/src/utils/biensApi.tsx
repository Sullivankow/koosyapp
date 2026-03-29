
// Fonctions d'appel API liées aux biens
import { API_BASE_URL, buildHeaders, getJson } from './api';
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

// Payload pour la création d'un bien (admin)
export type CreateBienPayload = {
  nom: string;
  adresse: string;
  type: string;
  superficie: number;
  pieces: number;
  statut?: 'disponible' | 'occupé' | 'travaux';
  proprietaire?: number;
};

// Payload pour la mise à jour d'un bien (admin)
export type UpdateBienPayload = Partial<CreateBienPayload>;

// Création d'un bien pour un utilisateur donné (vue admin)
export async function createBienForUser(
  userId: number,
  payload: CreateBienPayload,
): Promise<BackendBien> {
  const res = await fetch(`${API_BASE_URL}/biens/admin/${userId}` , {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la création du bien");
  }

  return res.json();
}

// Suppression d'un bien (vue admin)
export async function deleteBienAdmin(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/biens/admin/${id}` , {
    method: 'DELETE',
    headers: buildHeaders(),
  });

  if (!res.ok) {
    throw new Error('Erreur lors de la suppression du bien');
  }
}

// Mise à jour d'un bien pour un utilisateur donné (vue admin)
export async function updateBienForUser(
  userId: number,
  id: number,
  payload: UpdateBienPayload,
): Promise<BackendBien> {
  const res = await fetch(`${API_BASE_URL}/biens/admin/${userId}/${id}`, {
    method: 'PATCH',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la mise à jour du bien");
  }

  return res.json();
}

export default {
  fetchBiensList,
  fetchBiensAdminList,
  fetchBiensTotal,
  createBienForUser,
  deleteBienAdmin,
  updateBienForUser,
};