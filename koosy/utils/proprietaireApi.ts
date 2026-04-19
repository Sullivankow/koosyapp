
import { Proprietaire } from '../models/models';
import { apiFetch } from './baseApi';

// Type pour le quota de propriétaires (similaire à BienQuota)
export type ProprietaireQuota = {
	plan: 'gratuit' | 'premium';
	accessLevel: 'gratuit' | 'premium' | 'beta';
	limit: number | null;
	used: number;
	remaining: number | null;
	active: number;
	isLimited: boolean;
};

// Récupérer la liste des propriétaires existants
export async function getProprietaires(): Promise<Proprietaire[]> {
	return apiFetch('/proprietaire');
}

// Fonction pour créer un propriétaire
export async function createProprietaire(data: Omit<Proprietaire, 'id'>): Promise<Proprietaire> {
	return apiFetch('/proprietaire', {
		method: 'POST',
		body: JSON.stringify(data),
	});
}

// Fonction pour mettre à jour un propriétaire
export async function updateProprietaire(id: number | string, data: Partial<Proprietaire>): Promise<Proprietaire> {
	return apiFetch(`/proprietaire/${id}`, {
		method: 'PUT',
		body: JSON.stringify(data),
	});
}

// Fonction pour supprimer un propriétaire
export async function deleteProprietaire(id: number | string): Promise<void> {
	return apiFetch(`/proprietaire/${id}`, {
		method: 'DELETE',
	});
}

// Fonction pour récupérer le quota de propriétaires
export async function getProprietaireQuota(): Promise<ProprietaireQuota> {
	return apiFetch('/proprietaire/quota/info');
}
