
// Fonctions d'appel API liées aux utilisateurs
import { API_BASE_URL, buildHeaders, getJson } from './api';

// Liste complète des utilisateurs
export async function fetchUsersList(): Promise<any[] | null> {
  try {
    return await getJson<any[]>('/users');
  } catch (e) {
    console.error('Erreur lors de la récupération de la liste des utilisateurs :', e);
    return null;
  }
}

// Nombre total d'utilisateurs
export async function fetchUsersTotal(): Promise<number | null> {
  try {
    const users = await getJson<any[]>('/users');
    return users.length;
  } catch (e) {
    console.error('Erreur lors de la récupération des utilisateurs :', e);
    return null;
  }
}

export type CreateUserPayload = {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  role?: 'user' | 'admin';
  abonnement?: 'gratuit' | 'premium';
  telephone?: string;
};

// Création d'un nouvel utilisateur
export async function createUser(payload: CreateUserPayload): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Erreur lors de la création de l\'utilisateur');
  }

  return res.json();
}

export default {
  fetchUsersList,
  fetchUsersTotal,
  createUser,
};