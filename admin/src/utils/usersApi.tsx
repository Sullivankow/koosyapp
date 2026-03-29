
// Fonctions d'appel API liées aux utilisateurs
import { API_BASE_URL, buildHeaders, getJson } from './api';
import type { BackendUser } from '../models/models';

// Liste complète des utilisateurs
export async function fetchUsersList(): Promise<BackendUser[] | null> {
  try {
    return await getJson<BackendUser[]>('/users');
  } catch (e) {
    console.error('Erreur lors de la récupération de la liste des utilisateurs :', e);
    return null;
  }
}

// Nombre total d'utilisateurs
export async function fetchUsersTotal(): Promise<number | null> {
  try {
    const users = await getJson<BackendUser[]>('/users');
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

export type UpdateUserPayload = {
  email?: string;
  password?: string;
  nom?: string;
  prenom?: string;
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

// Mise à jour partielle d'un utilisateur existant
export async function updateUser(id: number, payload: UpdateUserPayload): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/users/${id}` , {
    method: 'PATCH',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Erreur lors de la mise à jour de l\'utilisateur');
  }

  return res.json();
}

// Suppression d'un utilisateur (admin uniquement)
export async function deleteUser(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/users/admin/${id}` , {
    method: 'DELETE',
    headers: buildHeaders(),
  });

  if (!res.ok) {
    throw new Error('Erreur lors de la suppression de l\'utilisateur');
  }
}

export default {
  fetchUsersList,
  fetchUsersTotal,
  createUser,
  updateUser,
  deleteUser,
};