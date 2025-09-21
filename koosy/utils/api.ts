

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
  if (!response.ok) throw new Error(await response.text());
  return response.json();
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

export async function getReservationsCount(): Promise<{ total: number }> {
  return apiFetch('/reservations/count');
}





