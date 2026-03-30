// Fonctions d'appel API liées aux réservations
import { API_BASE_URL, buildHeaders, getJson } from './api';
import type { BackendReservation, BackendReservationStatus } from '../models/models';

// Réservations à venir sur les N prochains jours (par défaut 7)
export async function fetchReservationsUpcomingTotal(days = 7): Promise<number | null> {
	try {
		const params = new URLSearchParams({ days: String(days) });
		const data = await getJson<{ total: number }>(`/reservations/events/upcoming?${params.toString()}`);
		return data.total;
	} catch (e) {
		console.error('Erreur lors de la récupération des réservations à venir :', e);
		return null;
	}
}

// Nombre total de réservations (toutes périodes confondues)
export async function fetchReservationsTotal(): Promise<number | null> {
	try {
		const reservations = await getJson<BackendReservation[]>('/reservations');
		return reservations.length;
	} catch (e) {
		console.error('Erreur lors de la récupération du nombre total de réservations :', e);
		return null;
	}
}

// Liste complète des réservations (vue admin)
export async function fetchReservationsAdminList(): Promise<BackendReservation[] | null> {
	try {
		return await getJson<BackendReservation[]>('/reservations');
	} catch (e) {
		console.error('Erreur lors de la récupération de la liste totale des réservations (admin) :', e);
		return null;
	}
}

// Alias pour compatibilité : liste des réservations (utilise la vue admin)
export async function fetchReservationsList(): Promise<BackendReservation[] | null> {
	return fetchReservationsAdminList();
}

// Payload pour la mise à jour d'une réservation (admin)
export type UpdateReservationPayload = {
	dateDebut?: string;
	dateFin?: string;
	statut?: BackendReservationStatus;
};

// Mise à jour d'une réservation par son id (admin)
export async function updateReservation(
	id: number,
	payload: UpdateReservationPayload,
): Promise<BackendReservation> {
	const res = await fetch(`${API_BASE_URL}/reservations/${id}`, {
		method: 'PATCH',
		headers: buildHeaders(),
		body: JSON.stringify(payload),
	});

	if (!res.ok) {
		throw new Error("Erreur lors de la mise à jour de la réservation");
	}

	return res.json();
}

export default {
	fetchReservationsUpcomingTotal,
	fetchReservationsTotal,
	fetchReservationsAdminList,
	fetchReservationsList,
	updateReservation,
};

