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
  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };
  return fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
}

export async function refreshSessionTokens(): Promise<boolean> {
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
