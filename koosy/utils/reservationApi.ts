import { apiFetch } from './baseApi';

// Fonction pour récupérer le nombre total de réservations
export async function getReservationsCount(): Promise<{ total: number }> {
  return apiFetch('/reservations/count');
}

// Fonction pour créer une réservation
export async function createReservation(data: {
  bienId: number;
  locataireNom: string;
  locatairePrenom: string;
  locataireEmail: string;
  locataireTelephone: string;
  dateDebut: string; // format JJ/MM/AAAA
  heureArrivee?: string;
  dateFin: string; // format JJ/MM/AAAA
  heureDepart?: string;
  statut?: 'en attente' | 'confirmée' | 'terminée' | 'annulée';
}) {
  return apiFetch('/reservations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Fonction pour récupérer la liste des réservations
export async function getReservations(): Promise<any[]> {
  return apiFetch('/reservations');
}

// Fonction pour récupérer une réservation par son id
export async function getReservationById(id: string | number): Promise<any> {
  return apiFetch(`/reservations/${id}`);
}

// Met à jour le statut d'une réservation (confirmée, annulée, etc.)
export async function updateReservationStatut(id: string | number, statut: 'en attente' | 'confirmée' | 'terminée' | 'annulée') {
  return apiFetch(`/reservations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ statut }),
  });
}

// Supprime une réservation par son id
export async function deleteReservation(id: string | number) {
  return apiFetch(`/reservations/${id}`, {
    method: 'DELETE',
  });
}

// Fonction pour modifier une réservation (tous champs)
export async function updateReservation(
  id: string | number,
  data: {
    bienId?: number;
    locataireNom?: string;
    locatairePrenom?: string;
    locataireEmail?: string;
    locataireTelephone?: string;
    dateDebut?: string;
    dateFin?: string;
    statut?: 'en attente' | 'confirmée' | 'terminée' | 'annulée';
  }
) {
  return apiFetch(`/reservations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Récupère les événements à venir (arrivées/départs/nouvelles réservations)
export async function getEventsUpcoming(days = 7, limit = 50, page = 1) {
  return apiFetch(`/reservations/events/upcoming?days=${days}&limit=${limit}&page=${page}`);
}