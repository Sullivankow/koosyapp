
// Petit client HTTP centralisé pour le backoffice admin Koosy
// Permet de récupérer les totaux utilisés sur le dashboard.

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:3000';

const buildHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  // À adapter quand l’authentification backoffice sera branchée
  const token = localStorage.getItem('token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: buildHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Erreur API ${res.status} sur ${path}`);
  }

  return (await res.json()) as T;
}

// ---------- Authentification backoffice ----------

export type LoginResponse = {
  access_token: string;
  prenom: string;
  nom: string;
  role: string;
};

export async function loginBackoffice(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error('Email ou mot de passe incorrect');
  }

  return (await res.json()) as LoginResponse;
}

// ---------- Utilisateurs ----------

// Liste complète des utilisateurs
export async function fetchUsersList(): Promise<any[] | null> {
  try {
    return await getJson<any[]>('/users');
  } catch (e) {
    console.error('Erreur lors de la récupération de la liste des utilisateurs :', e);
    return null;
  }
}

export async function fetchUsersTotal(): Promise<number | null> {
  try {
    const users = await getJson<any[]>('/users');
    return users.length;
  } catch (e) {
    console.error('Erreur lors de la récupération des utilisateurs :', e);
    return null;
  }
}

// ---------- Biens ----------

// Liste des biens de l'utilisateur connecté (vue conciergerie)
export async function fetchBiensList(): Promise<any[] | null> {
  try {
    return await getJson<any[]>('/biens');
  } catch (e) {
    console.error('Erreur lors de la récupération de la liste des biens :', e);
    return null;
  }
}

// Liste complète de tous les biens (vue admin)
export async function fetchBiensAdminList(): Promise<any[] | null> {
  try {
    return await getJson<any[]>('/biens/admin');
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
    const reservations = await getJson<any[]>('/reservations');
    return reservations.length;
  } catch (e) {
    console.error('Erreur lors de la récupération du nombre total de réservations :', e);
    return null;
  }
}

// Liste complète des réservations (vue admin)
export async function fetchReservationsAdminList(): Promise<any[] | null> {
  try {
    return await getJson<any[]>('/reservations');
  } catch (e) {
    console.error('Erreur lors de la récupération de la liste totale des réservations (admin) :', e);
    return null;
  }
}

// Alias pour compatibilité : liste des réservations (utilise la vue admin)
export async function fetchReservationsList(): Promise<any[] | null> {
  return fetchReservationsAdminList();
}

// Nombre total de tâches « à faire » (toutes conciergeries confondues, vue admin)
export async function fetchTachesAFaireTotal(): Promise<number | null> {
  try {
    const taches = await getJson<any[]>('/taches/admin');
    // On compte uniquement les tâches dont le statut est "à faire"
    return taches.filter((t: any) => t.statut === 'à faire').length;
  } catch (e) {
    console.error('Erreur lors de la récupération du nombre de tâches à faire :', e);
    return null;
  }
}

// Liste complète des tâches (vue admin)
export async function fetchTachesAdminList(): Promise<any[] | null> {
  try {
    return await getJson<any[]>('/taches/admin');
  } catch (e) {
    console.error('Erreur lors de la récupération de la liste totale des tâches (admin) :', e);
    return null;
  }
}

// Alias pour compatibilité : liste des tâches
export async function fetchTachesList(): Promise<any[] | null> {
  return fetchTachesAdminList();
}

// Nombre total de devis accessibles (compte côté front en attendant un endpoint dédié)
export async function fetchDevisTotal(): Promise<number | null> {
  try {
    const devis = await getJson<any[]>('/devis');
    return devis.length;
  } catch (e) {
    console.error('Erreur lors de la récupération des devis :', e);
    return null;
  }
}

// Liste complète des devis
export async function fetchDevisList(): Promise<any[] | null> {
  try {
    return await getJson<any[]>('/devis');
  } catch (e) {
    console.error('Erreur lors de la récupération de la liste des devis :', e);
    return null;
  }
}

// Nombre total de factures accessibles (compte côté front en attendant un endpoint dédié)
export async function fetchFacturesTotal(): Promise<number | null> {
  try {
    const factures = await getJson<any[]>('/facture');
    return factures.length;
  } catch (e) {
    console.error('Erreur lors de la récupération des factures :', e);
    return null;
  }
}

// Liste complète des factures
export async function fetchFacturesList(): Promise<any[] | null> {
  try {
    return await getJson<any[]>('/facture');
  } catch (e) {
    console.error('Erreur lors de la récupération de la liste des factures :', e);
    return null;
  }
}

export type DashboardStats = {
  usersTotal: number | null;
  biensTotal: number | null;
  reservationsUpcomingTotal: number | null;
  reservationsTotal: number | null;
  tachesAFaireTotal: number | null;
  devisTotal: number | null;
  facturesTotal: number | null;
};

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [
    usersTotal,
    biensTotal,
    reservationsUpcomingTotal,
    reservationsTotal,
    tachesAFaireTotal,
    devisTotal,
    facturesTotal,
  ] = await Promise.all([
    fetchUsersTotal(),
    fetchBiensTotal(),
    fetchReservationsUpcomingTotal(7),
    fetchReservationsTotal(),
    fetchTachesAFaireTotal(),
    fetchDevisTotal(),
    fetchFacturesTotal(),
  ]);

  return {
    usersTotal,
    biensTotal,
    reservationsUpcomingTotal,
    reservationsTotal,
    tachesAFaireTotal,
    devisTotal,
    facturesTotal,
  };
}
