




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
  // Si la réponse est vide ou status 204, ne pas parser en JSON
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



//Fonction pour supprimer une tâche par son ID
export async function deleteTache(id: number | string): Promise<void> {
  await apiFetch(`/taches/${id}`, {
    method: 'DELETE',
  });
}



