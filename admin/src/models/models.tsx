
// Types partagés alignés sur le backend Nest

// ---------- Biens ----------

export interface BackendProprietaire {
  id: number;
  nom: string;
  prenom: string;
  email: string;
}

export interface BackendBien {
  id: number;
  nom: string;
  adresse: string;
  type: string;
  statut: 'disponible' | 'occupé' | 'travaux';
  proprietaire?: BackendProprietaire | null;
  remarque?: string | null;
  lat?: number | null;
  lng?: number | null;
}

// ---------- Utilisateurs ----------

export type BackendUserRole = 'user' | 'admin';

export interface BackendEntreprise {
  id: number;
  nom: string;
}

export interface BackendUser {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string | null;
  abonnement: 'gratuit' | 'premium';
  role: BackendUserRole;
  entreprise?: BackendEntreprise | null;
  // Champs supplémentaires disponibles côté backend mais pas encore utilisés dans l'admin :
  // entreprise?: any;
  // settings?: any;
  // expoPushToken?: string | null;
}

// D'autres modèles (réservations, tâches, etc.) pourront être ajoutés ici au fur et à mesure
