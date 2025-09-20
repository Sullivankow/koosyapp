
import { getSession } from './session';
const BASE_URL = 'http://localhost:3000'; // à adapter selon ton environnement


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
export function login(data: { email: string; password: string }) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}