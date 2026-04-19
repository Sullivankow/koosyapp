import { Bien } from '../models/models';
import { BASE_URL } from '../constants/config';
import { apiFetch } from './baseApi';
import { getSession } from './session';

export type BienQuota = {
  plan: 'gratuit' | 'premium';
  accessLevel: 'gratuit' | 'premium' | 'beta';
  limit: number | null;
  used: number;
  remaining: number | null;
  active: number;
  isLimited: boolean;
};

// Fonction pour récupérer le nombre total de biens
export async function getBiensCount(): Promise<{ total: number }> {
  return apiFetch('/biens/count');
}

// Récupère les informations de quota d'ajout de biens de l'utilisateur connecté
export async function getBienQuota(): Promise<BienQuota> {
  return apiFetch('/biens/quota');
}

// Récupérer la liste des biens de l'utilisateur connecté
export async function getBiens(): Promise<Bien[]> {
  const biens = await apiFetch('/biens');
  return (biens || []).map((bien: any) => {
    if (bien.proprietaire && !bien.proprio) {
      return { ...bien, proprio: bien.proprietaire };
    }
    return bien;
  });
}

// Récupère un bien par son id
export async function getBienById(id: string | number): Promise<any> {
  return apiFetch(`/biens/${id}`);
}

//Fonction pour récupérer l'URL complète d'une image d'un bien
export function getImageUrl(url: string): string {
  if (!url) return '';
  const cleanUrl = url.replace(/[\\/]/g, '/');
  return cleanUrl.startsWith('http') ? cleanUrl : `${BASE_URL}/${cleanUrl}`;
}

//Fonction pour créer un nouveau bien
export async function createBien(data: {
  nom: string;
  adresse: string;
  type?: string;
  superficie: number;
  pieces: number;
  proprietaire: number;
  equipements?: string[];
}): Promise<{ id: number }> {
  const res = await apiFetch('/biens', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return { id: res.id ?? res.bien?.id ?? res['id'] };
}

// Fonction pour uploader les images d'un bien
export async function uploadBienImages(bienId: number, imageUris: string[]): Promise<void> {
  const session = await getSession();
  const token = session?.token;
  for (const uri of imageUris) {
    const formData = new FormData();
    const filename = uri.split('/').pop() || `image_${Date.now()}.jpg`;
    const match = uri.match(/\.(\w+)$/);
    const type = match ? `image/${match[1]}` : 'image';
    formData.append('file', {
      uri,
      name: filename,
      type,
    } as any);
    await fetch(`${BASE_URL}/bien-image/biens/${bienId}/images`, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
  }
}

// Fonction pour modifier un bien
export async function updateBien(id: string, data: any): Promise<any> {
  return apiFetch(`/biens/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Utilise l'endpoint backend pour géocoder une adresse (le backend centralise la clé)
export async function geocodeAdresse(adresse: string): Promise<{ lat: number; lng: number } | null> {
  if (!adresse) return null;
  try {
    const res = await apiFetch(`/biens/geocode?adresse=${encodeURIComponent(adresse)}`);
    return res ?? null;
  } catch {
    return null;
  }
}

//Fonction pour supprimer un bien par son iD
export async function deleteBien(id: string): Promise<void> {
  return apiFetch(`/biens/${id}`, {
    method: 'DELETE',
  });
}