export interface Commentaire {
  id: string;
  texte: string;
  date: string;
}
export interface Proprio {
  id: string;
  nom: string;
  email: string;
  telephone: string;
}
// Définition des types pour la gestion des biens, locataires et tâches

export interface Bien {
  id: string;
  nom: string;
  adresse: string;
  type: string;
  superficie: number;
  pieces: number;
  equipements: string[];
  photos: string[];
  locataires: Locataire[];
  taches: Tache[];
  geo: { lat: number; lng: number };
  statut: 'disponible' | 'occupé' | 'travaux';
  historique: any[];
  proprio: Proprio;
  commentaires?: Commentaire[];
}

export interface Locataire {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  dateArrivee?: string;
  dateDepart?: string;
  bienId?: string;
}

export interface Tache {
  id: string;
  titre: string;
  description: string;
  statut: 'à faire' | 'en cours' | 'terminée';
  bienId: string;
  dateEcheance?: string;
}


export interface Reservation {
  id: string;
  bienId: string; //le logement réservé
  locataireId: string; //la personne qui réserve
  dateArrivee: string; //quand la personne commence
  dateDepart: string; //quand la personne finit
  heureArrivee: string; // Heure d'arrivée (format HH:mm)
  heureDepart: string;  // Heure de départ (format HH:mm)
  statut: 'confirmée' | 'en attente' | 'annulée';
}


export interface EvenementAgenda {
  id: string;
  date: string;
  type: 'entrée' | 'départ';
  locataireId: string;
  bienId: string;
  couleur: string;
}