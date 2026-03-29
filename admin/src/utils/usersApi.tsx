
// Fonctions d'appel API liées aux utilisateurs
import { getJson } from './api';

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

export default {
  fetchUsersList,
  fetchUsersTotal,
};