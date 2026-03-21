

/* -------------------------------------------------------------------------- */
/*  Fonctions API centralisées pour les notifications (utiliser depuis le client) */
/*  Toutes les fonctions ci‑dessous utilisent `apiFetch` qui gère le token et la BASE_URL */
/* -------------------------------------------------------------------------- */



import { Devis } from '../models/models';
import { getSession } from './session';
const BASE_URL = 'http://192.168.1.67:3000'; // à adapter selon ton environnement


// Simule la récupération d'un token JWT stocké localement

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const session = await getSession();
  const token = session?.token;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  if (!response.ok) throw new Error(await response.text() || `Erreur API: ${response.status}`);
  if (response.status === 204) return;
  const text = await response.text();
  if (!text) return;
  return JSON.parse(text);
}


// Fonction d'inscription
export function signup(data: { nom: string; prenom: string; email: string; password: string }) {
  return apiFetch('/users', {
    method: 'POST',
    body: JSON.stringify({
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      password: data.password,
    }),
  });
}

// Fonction de connexion
export async function login({ email, password }: { email: string; password: string }) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new Error('Identifiants invalides');
  }
  return await response.json(); // { access_token: ... }
}

//PAGE D'ACCUEIL
//Fonction pour récupérer le nombre total de biens
export async function getBiensCount(): Promise<{ total: number }> {
  return apiFetch('/biens/count');
}


//Fonction pour récupérer le nombre total de locataires
export async function getReservationsCount(): Promise<{ total: number }> {
  return apiFetch('/reservations/count');
}


// Fonction pour récupérer le nombre total de tâches à faire
export async function getTachesAFaireTotal(): Promise<{ total: number }> {
  return apiFetch('/taches/count-a-faire-total');
}

// Récupérer la liste des biens de l'utilisateur connecté
import { Bien } from '../models/models';
export async function getBiens(): Promise<Bien[]> {
  return apiFetch('/biens');
}

// Récupère un bien par son id
export async function getBienById(id: string | number): Promise<any> {
  return apiFetch(`/biens/${id}`);
}


//Fonction pour récupérer l'URL complète d'une image d'un bien
export function getImageUrl(url: string): string {
  if (!url) return '';
  const cleanUrl = url.replace(/\\\\|\\/g, '/');
  return cleanUrl.startsWith('http') ? cleanUrl : `${BASE_URL}/${cleanUrl}`;
}

//Fonction pour créer un nouveau bien
export async function createBien(data: {

  nom: string;
  adresse: string;
  type?: string;
  superficie: number;
  pieces: number;
  proprietaireNom: string;
  proprietaireEmail: string;
  proprietaireTelephone?: string;
  equipements?: string[];
}): Promise<{ id: number }> {
  // On attend un objet avec l'id du bien créé
  const res = await apiFetch('/biens', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  // Si le backend retourne l'objet bien, on extrait l'id
  return { id: res.id ?? res.bien?.id ?? res["id"] };
}
// Fonction pour uploader les images d'un bien
export async function uploadBienImages(bienId: number, imageUris: string[]): Promise<void> {
  const session = await getSession();
  const token = session?.token;
  for (const uri of imageUris) {
    const formData = new FormData();
    // Expo-image-picker retourne un uri local, il faut le transformer en fichier
    const filename = uri.split('/').pop() || `image_${Date.now()}.jpg`;
    const match = uri.match(/\.(\w+)$/);
    const type = match ? `image/${match[1]}` : `image`;
    formData.append('file', {
      uri,
      name: filename,
      type,
    } as any);
    await fetch(`${BASE_URL}/bien-image/biens/${bienId}/images`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
  }
}



// Fonction pour modifier un bien
export async function updateBien(id: string, data: any): Promise<any> {
  const session = await getSession();
  const token = session?.token;
  return apiFetch(`/biens/${id}`, {
    method: 'PATCH',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
}

// Utilise l'endpoint backend pour géocoder une adresse (le backend centralise la clé)
export async function geocodeAdresse(adresse: string): Promise<{ lat: number; lng: number } | null> {
  if (!adresse) return null;
  try {
    const res = await apiFetch(`/biens/geocode?adresse=${encodeURIComponent(adresse)}`);
    // Le backend retourne { lat, lng } ou null
    return res ?? null;
  } catch (err) {
    // Ne pas faire planter l'app si le géocodage échoue
    return null;
  }
}



//Fonction pour supprimer un bien par son iD
export async function deleteBien(id: string): Promise<void> {
  const session = await getSession();
  const token = session?.token;
  return apiFetch(`/biens/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}



//Fonction pour créer une nouvelle tâche

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
  return { id: res.id ?? res.tache?.id ?? res["id"] };
}


// Fonction pour récupérer la liste des tâches
export async function getTaches(): Promise<any[]> {
  return apiFetch('/taches');
}

//Fontion pour mettre à jour le status d'une tâche

//Fonction pour supprimer une tâche par son ID
export async function deleteTache(id: number | string): Promise<void> {
  await apiFetch(`/taches/${id}`, {
    method: 'DELETE',
  });
}


//Fonction pour marquer une tâche comme terminée
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



//Fonction pour supprimer toutes les tâches terminées

export async function deleteAllTachesTerminees() {
  const session = await getSession();
  const token = session?.token;
  const response = await fetch(`${BASE_URL}/taches/terminees`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    throw new Error('Erreur lors de la suppression des tâches terminées');
  }
  return response.json();
}

// Fonction pour créer une réservation
export async function createReservation(data: {
  bienId: number;
  locataireNom: string;
  locatairePrenom: string;
  locataireEmail: string;
  locataireTelephone: string;
  dateDebut: string; // format JJ/MM/AAAA
  dateFin: string; // format JJ/MM/AAAA
  statut?: 'en attente' | 'confirmée' | 'terminée' | 'annulée';
}) {
  return apiFetch('/reservations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}


//Fonction pour récupérer la liste des réservations
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

//Fonction pour modifier une réservation 
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

// Sauvegarde le token de push (ou le supprime si token === null)
export async function savePushToken(token: string | null, platform?: string) {
  return apiFetch('/notifications/me/push-token', {
    method: 'POST',
    body: JSON.stringify({ token, platform }),
  });
}

/**
 * Met à jour partiellement les settings de l'utilisateur (merge-safe).
 * body attendu: { settings: { ... } }
 */
export async function updateUserSettings(settings: Record<string, any>) {
  return apiFetch('/users/me/settings', {
    method: 'PUT',
    body: JSON.stringify({ settings }),
  });
}


/**
 * Récupère le nombre de notifications non lues pour l'utilisateur connecté.
 * Retourne un objet { unread: number }.
 */
export async function getNotificationsUnreadCount(): Promise<{ unread: number }> {
  return apiFetch('/notifications/unread-count');
}

// Récupère les informations de l'utilisateur connecté (incluant settings)
export async function getMe(): Promise<any> {
  return apiFetch('/users/me');
}

// Récupère les événements à venir (arrivées/départs/nouvelles réservations)
export async function getEventsUpcoming(days = 7, limit = 50, page = 1) {
  return apiFetch(`/reservations/events/upcoming?days=${days}&limit=${limit}&page=${page}`);
}

/**
 * Récupère la liste paginée des notifications pour l'utilisateur connecté.
 * page: numéro de page (1-based), limit: éléments par page.
 * Retour attendu: { items: Notification[], total: number, page, limit }
 */
export async function listNotifications(page = 1, limit = 20) {
  return apiFetch(`/notifications?page=${page}&limit=${limit}`);
}

/**
 * Marque une notification spécifique comme lue.
 * id: identifiant de la notification
 * Retour: généralement { success: true, unread: number }
 */
export async function markNotificationRead(id: number) {
  return apiFetch(`/notifications/${id}/mark-read`, { method: 'POST' });
}

/**
 * Marque toutes les notifications de l'utilisateur comme lues.
 * Retour: { success: true, unread: 0 } ou similar
 */
export async function markAllNotificationsRead() {
  return apiFetch('/notifications/mark-all-read', { method: 'POST' });
}

/**
 * Supprime une notification par son id pour l'utilisateur connecté.
 * Retour attendu: { success: true, unread: number }
 */
export async function deleteNotification(id: number) {
  return apiFetch(`/notifications/${id}`, { method: 'DELETE' });
}

/**
 * Endpoint admin/test pour créer et envoyer une notification à un utilisateur.
 * payload: { userId, title, body, data? }
 * ATTENTION: endpoint protégé par JWT, en prod restreindre aux admins.
 */
export async function adminSendNotification(payload: { userId: number; title: string; body?: string; data?: any }) {
  return apiFetch('/notifications/admin/send', { method: 'POST', body: JSON.stringify(payload) });
}

// Fonction pour créer une prestation
import type { PrestationStatus } from '../components/AddPrestationModal';

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
  return { id: res.id ?? res.prestation?.id ?? res["id"] };
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
export async function getChiffreAffaire(from: string, to: string, status = 'Terminée') {
  // Si le paramètre status n'est pas géré par le backend, retire-le de l'URL
  return apiFetch(`/prestations/summary?from=${from}&to=${to}&status=${status}`);
}

// Fonction pour modifier le profil utilisateur principal (champ telephone, etc.) via PATCH /users/:id.
export async function updateMe(data: any) {
  const user = await getMe();
  const userId = user?.id;
  if (!userId) throw new Error('Utilisateur non authentifié');
  return apiFetch(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Fonction pour supprimer le compte utilisateur
export async function deleteMe() {
  const user = await getMe();
  const userId = user?.id;
  if (!userId) throw new Error('Utilisateur non authentifié');
  return apiFetch(`/users/${userId}`, {
    method: 'DELETE',
  });
}

// Fonction pour récupérer une entreprise par son ID

export async function getEntrepriseById(id: number | string): Promise<any> {
  return apiFetch(`/entreprise/${id}`);
}

// Crée une nouvelle entreprise
export async function createEntreprise(data: Omit<import('../models/models').Entreprise, 'id'>): Promise<any> {
  const session = await getSession();
  const token = session?.token;
  return apiFetch('/entreprise', {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
}

// --------------------------------------------------------------------------
// Fonction pour modifier une entreprise (PATCH /entreprise/:id)
// Utiliser cette fonction pour mettre à jour les informations d'une entreprise
// Paramètres : id de l'entreprise et données à modifier (objet)
// Retourne l'objet entreprise mis à jour
// --------------------------------------------------------------------------
export async function updateEntreprise(id: number | string, data: Partial<any>): Promise<any> {
  // Utilise PUT car le backend n'accepte que PUT pour la mise à jour
  return apiFetch(`/entreprise/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Supprime une entreprise par son id
export async function deleteEntreprise(id: number): Promise<void> {
  const session = await getSession();
  const token = session?.token;
  return apiFetch(`/entreprise/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

// Fonction pour créer un devis lié à l'utilisateur connecté (l'entreprise est gérée côté backend)

export async function createDevis(data: Omit<Devis, 'id' | 'entreprise'>): Promise<{ id: number }> {
  const res = await apiFetch('/devis', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return { id: res.id ?? res.devis?.id ?? res["id"] };
}



// Récupère l'entreprise liée à l'utilisateur connecté
export async function apiFetchMyEntreprise() {
  return apiFetch('/entreprise/mienne');
}

// Fonction pour récupérer la liste des devis
export async function getDevis(): Promise<Devis[]> {
  const data = await apiFetch('/devis');
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

// Fonction pour supprimer un devis par son ID
export async function deleteDevis(id: number): Promise<void> {
  return apiFetch(`/devis/${id}`, {
    method: 'DELETE',
  });
}


// Retourne l'URL du PDF d'un devis
export function getDevisPdfUrl(id: number) {
  return `${BASE_URL}/devis/${id}/pdf`;
}


import { Facture } from '../models/models';
// Fonction pour récupérer la liste des factures
export async function getFactures(): Promise<Facture[]> {
  // Correction : endpoint au singulier pour correspondre au backend
  const data = await apiFetch('/facture');
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

// Fonction pour supprimer une facture par son ID
export async function deleteFacture(id: number): Promise<void> {
  return apiFetch(`/facture/${id}`, {
    method: 'DELETE',
  });
}

// Fonction pour créer une facture liée à l'utilisateur connecté (l'entreprise est gérée côté backend)
// Correction : endpoint au singulier pour correspondre au backend
export async function createFacture(data: Omit<Facture, 'id' | 'entreprise'>): Promise<{ id: number }> {
  const res = await apiFetch('/facture', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return { id: res.id ?? res.facture?.id ?? res["id"] };
}

// Retourne l'URL du PDF d'une facture
export function getFacturePdfUrl(id: number) {
  return `${BASE_URL}/facture/${id}/pdf`;
}