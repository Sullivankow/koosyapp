/* -------------------------------------------------------------------------- */
/*  Fonctions API centralisées côté client (biens, tâches, réservations,       */
/*  notifications, devis, factures, etc.).                                    */
/*  La plupart des helpers ci‑dessous passent par `apiFetch`, qui ajoute      */
/*  automatiquement la BASE_URL et le token JWT quand il existe.              */
/* -------------------------------------------------------------------------- */
import { Charge, Devis, Facture } from '../models/models';
import { clearSession, getSession, saveSession } from './session';
import { BASE_URL } from '../constants/config';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

let refreshInFlight: Promise<boolean> | null = null;

async function doApiFetch(endpoint: string, options: RequestInit = {}, accessToken?: string) {
  // Comme dans baseApi: respecter les headers fournis et ne pas forcer
  // `Content-Type` si le body est un FormData (multipart uploads).
  const incomingHeaders: Record<string, string> = (options.headers && typeof options.headers === 'object') ? (options.headers as any) : {};
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...incomingHeaders,
  };

  if (!('Content-Type' in headers) && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
}

async function refreshSessionTokens(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const session = await getSession();
      const refreshToken = session?.refreshToken;
      if (!refreshToken || !session?.email) {
        return false;
      }

      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        await clearSession();
        return false;
      }

      const payload = await response.json();
      if (!payload?.access_token) {
        await clearSession();
        return false;
      }

      await saveSession(session.email, payload.access_token, payload.refresh_token ?? refreshToken);
      return true;
    })().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

/**
 * Helper HTTP générique pour appeler l'API Koosy côté client.
 * - Préfixe automatiquement l'URL avec BASE_URL
 * - Ajoute le header Authorization Bearer <token> si une session existe
 * - Tente un refresh automatique une fois en cas de 401
 * - Gère les réponses vides (204, body vide) et parse le JSON sinon.
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const session = await getSession();
  const token = session?.accessToken || session?.token;
  let response = await doApiFetch(endpoint, options, token);

  if (response.status === 401 && !endpoint.startsWith('/auth/')) {
    const refreshed = await refreshSessionTokens();
    if (refreshed) {
      const updatedSession = await getSession();
      response = await doApiFetch(endpoint, options, updatedSession?.accessToken || updatedSession?.token);
      if (response.status === 401) {
        await clearSession();
      }
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    let message = errorText || `Erreur API: ${response.status}`;
    try {
      const parsed = errorText ? JSON.parse(errorText) : null;
      if (parsed && typeof parsed.message === 'string') {
        message = parsed.message;
      } else if (parsed && Array.isArray(parsed.message)) {
        message = parsed.message.join('\n');
      }
    } catch {
      // Si le body n'est pas du JSON, on garde le texte brut.
    }
    throw new ApiError(message, response.status);
  }
  if (response.status === 204) return;
  const text = await response.text();
  if (!text) return;
  return JSON.parse(text);
}

// Fonction d'inscription d'un utilisateur (écran SignUp)
export function signup(data: { nom: string; prenom: string; email: string; password: string; role?: string }) {
  return apiFetch('/users', {
    method: 'POST',
    body: JSON.stringify({
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      password: data.password,
      ...(data.role ? { role: data.role } : {}),
    }),
  });
}

// Fonction de connexion : renvoie typiquement { access_token, refresh_token }
export async function login({ email, password }: { email: string; password: string }) {
  // Appel direct à l'endpoint /auth/login — on n'utilise pas apiFetch
  // pour la connexion initiale afin d'éviter d'envoyer un header
  // Authorization résiduel ou d'interférer avec la logique de refresh.
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = typeof errorBody?.message === 'string'
      ? errorBody.message
      : 'Identifiants invalides';
    
    throw new Error(message);
  }

  return response.json();
}

/**
 * Déconnecte la session courante côté serveur puis efface la session locale.
 * Utilise le refresh token pour révoquer la session même si l'access token a expiré.
 */
export async function logoutCurrentSession() {
  const session = await getSession();
  if (session?.refreshToken) {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      });
    } catch {
      // On nettoie quand même la session locale.
    }
  }
  await clearSession();
}



//PAGE D'ACCUEIL
//Fonction pour récupérer le nombre total de locataires
export {
  getReservationsCount,
  createReservation,
  getReservations,
  getReservationById,
  updateReservationStatut,
  deleteReservation,
  updateReservation,
  getEventsUpcoming,
} from './reservationApi';


// Fonction pour récupérer le nombre total de tâches à faire
export {
  getTachesAFaireTotal,
  createTache,
  getTaches,
  deleteTache,
  markTacheAsTerminee,
  updateTacheStatut,
  deleteAllTachesTerminees,
} from './tachesApi';

export {
  getBiensCount,
  getBiens,
  getBienById,
  getImageUrl,
  createBien,
  uploadBienImages,
  updateBien,
  geocodeAdresse,
  deleteBien,
} from './bienApi';





// Sauvegarde le token de push (ou le supprime si token === null)
export async function savePushToken(token: string | null, platform?: string) {
  return apiFetch('/notifications/me/push-token', {
    method: 'POST',
    body: JSON.stringify({ token, platform }),
  });
}

/**
 * Récupère le nombre de notifications non lues pour l'utilisateur connecté.
 * Retourne un objet { unread: number }.
 */
export async function getNotificationsUnreadCount(): Promise<{ unread: number }> {
  return apiFetch('/notifications/unread-count');
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


// Récupère les informations de l'utilisateur connecté (incluant settings)
export async function getMe(): Promise<any> {
  return apiFetch('/users/me');
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



/**
 * Endpoint admin/test pour créer et envoyer une notification à un utilisateur.
 * payload: { userId, title, body, data? }
 * ATTENTION: endpoint protégé par JWT, en prod restreindre aux admins.
 */
export async function adminSendNotification(payload: { userId: number; title: string; body?: string; data?: any }) {
  return apiFetch('/notifications/admin/send', { method: 'POST', body: JSON.stringify(payload) });
}




// Fonction pour créer une prestation
export {
  createPrestation,
  getPrestations,
  getPrestationsTerminees,
  getPrestationsTermineesCount,
  updatePrestationStatut,
  deletePrestation,
  getChiffreAffaire,
} from './prestationsApi';



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

// Crée une charge utilisateur (montant en euros).
// La date reste textuelle côté front afin de rester lisible pour l'utilisateur.
export async function createCharge(data: {
  libelle: string;
  amount: number;
  date_charge?: string;
  categorie?: string;
  notes?: string;
}) {
  return apiFetch('/charges', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Liste les charges de l'utilisateur connecté.
export async function getCharges(params?: { page?: number; limit?: number; from?: string; to?: string }) {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.from) q.set('from', params.from);
  if (params?.to) q.set('to', params.to);
  const suffix = q.toString() ? `?${q.toString()}` : '';
  return apiFetch(`/charges${suffix}`);
}

// Résumé des charges sur une période.
export async function getChargesSummary(from: string, to: string) {
  return apiFetch(`/charges/summary?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
}

export async function updateCharge(
  id: number | string,
  data: {
    libelle?: string;
    amount?: number;
    date_charge?: string;
    categorie?: string;
    notes?: string;
  }
): Promise<Charge> {
  return apiFetch(`/charges/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteCharge(id: number | string): Promise<void> {
  await apiFetch(`/charges/${id}`, {
    method: 'DELETE',
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
// Fonction pour récupérer la liste des factures
export async function getFactures(): Promise<Facture[]> {
 
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

export {
  getProprietaires,
  createProprietaire,
  updateProprietaire,
  deleteProprietaire,
} from './proprietaireApi';
