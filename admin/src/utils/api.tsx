
// Petit client HTTP centralisé pour le backoffice admin Koosy
// Permet de récupérer les totaux utilisés sur le dashboard.

export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:3000';

export const buildHeaders = (): HeadersInit => {
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

export async function getJson<T>(path: string): Promise<T> {
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
// Toutes les autres méthodes domaine (utilisateurs, biens, réservations, tâches,
// devis, factures, dashboard...) ont été déplacées dans des fichiers *Api.tsx dédiés.
