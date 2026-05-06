import { BASE_URL } from '../constants/config';
import { apiFetch } from './baseApi';
import { getSession } from './session';

// Fonction pour récupérer le nombre total de tâches à faire
export async function getTachesAFaireTotal(): Promise<{ total: number }> {
  return apiFetch('/taches/count-a-faire-total');
}

// Fonction pour créer une nouvelle tâche
export async function createTache(data: {
  titre: string;
  description?: string;
  statut?: 'à faire' | 'en cours' | 'terminée';
  bienId: number;
  dateEcheance?: string; // format JJ/MM/AAAA
}): Promise<{ id: number }> {
  const res = await apiFetch('/taches', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return { id: res.id ?? res.tache?.id ?? res['id'] };
}

// Fonction pour récupérer la liste des tâches
export async function getTaches(): Promise<any[]> {
  return apiFetch('/taches');
}

// Fonction pour supprimer une tâche par son ID
export async function deleteTache(id: number | string): Promise<void> {
  await apiFetch(`/taches/${id}`, {
    method: 'DELETE',
  });
}

// Fonction pour marquer une tâche comme terminée
export async function markTacheAsTerminee(id: number | string): Promise<void> {
  await apiFetch(`/taches/${id}/terminee`, {
    method: 'PATCH',
  });
}

// Fonction pour mettre à jour le statut d'une tâche
export async function updateTacheStatut(id: number | string, statut: string): Promise<void> {
  await apiFetch(`/taches/${id}/statut`, {
    method: 'PATCH',
    body: JSON.stringify({ statut }),
  });
}

// Fonction pour supprimer toutes les tâches terminées
export async function deleteAllTachesTerminees() {
  const session = await getSession();
  const token = session?.token;
  // Utiliser apiFetch pour bénéficier de la gestion de token/refresh et
  // du traitement centralisé des erreurs.
  await apiFetch('/taches/terminees', {
    method: 'DELETE',
  });
  // apiFetch lève une ApiError en cas d'erreur; s'il n'y a pas d'erreur
  // on renvoie void.
  return;
}