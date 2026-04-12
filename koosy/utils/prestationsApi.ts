import { apiFetch } from './api';
import type { PrestationStatus } from '../components/modals/AddPrestationModal';

// Fonction pour créer une prestation
export async function createPrestation(data: {
	bienId: number;
	amount: number;
	description?: string;
	date_prestation?: string;
	status?: PrestationStatus;
}): Promise<{ id: number }> {
	const res = await apiFetch('/prestations', {
		method: 'POST',
		body: JSON.stringify(data),
	});
	return { id: res.id ?? res.prestation?.id ?? res['id'] };
}

// Fonction pour récupérer la liste des prestations
export async function getPrestations(): Promise<any[]> {
	const data = await apiFetch('/prestations');
	if (Array.isArray(data)) return data;
	if (data && Array.isArray(data.items)) return data.items;
	return [];
}

// Fonction pour récupérer la liste des prestations terminées via le nouvel endpoint
export async function getPrestationsTerminees(): Promise<any[]> {
	const data = await apiFetch('/prestations/terminees');
	if (Array.isArray(data)) return data;
	if (data && Array.isArray(data.items)) return data.items;
	return [];
}

// Fonction pour compter le nombre de prestations terminées
export async function getPrestationsTermineesCount(): Promise<number> {
	const prestations = await getPrestationsTerminees();
	return prestations.length;
}

// Fonction pour changer le statut d'une prestation
export async function updatePrestationStatut(id: number, status: string) {
	return apiFetch(`/prestations/${id}/status`, {
		method: 'PATCH',
		body: JSON.stringify({ status }),
	});
}

// Fonction pour supprimer une prestation
export async function deletePrestation(id: number) {
	return apiFetch(`/prestations/${id}`, {
		method: 'DELETE',
	});
}

// Fonction pour récupérer le chiffre d'affaires total sur une période donnée
export async function getChiffreAffaire(from: string, to: string) {
	// Règle métier: le backend calcule le CA uniquement sur les prestations terminées.
	return apiFetch(`/prestations/summary?from=${from}&to=${to}`);
}
