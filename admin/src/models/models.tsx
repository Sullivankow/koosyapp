
// Types partagés alignés sur le backend Nest

// ---------- Biens ----------

// ---------- Locataires ----------

export interface BackendLocataire {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
}

// ---------- Réservations ----------

export type BackendReservationStatus = 'en attente' | 'confirmée' | 'terminée' | 'annulée';

export interface BackendReservation {
  id: number;
  bien: BackendBien;
  locataire: BackendLocataire;
  dateDebut: string | Date;
  dateFin: string | Date;
  statut: BackendReservationStatus;
}

export interface BackendProprietaire {
  id: number;
  nom: string;
  prenom: string;
  email: string;
}

export interface BackendBienImage {
  id: number;
  url: string;
}

export interface BackendBien {
  id: number;
  nom: string;
  adresse: string;
  type: string;
  statut: 'disponible' | 'occupé' | 'travaux';
  superficie?: number;
  pieces?: number;
  proprietaire?: BackendProprietaire | null;
  images?: BackendBienImage[] | null;
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
