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
  dateCreation: string;
}

export interface Locataire {
  id: string;
  nom: string;
  prenom: string;
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
  bienId: string;
  locataireId: string;
  dateArrivee?: string;
  dateDepart?: string;
  heureArrivee?: string;
  heureDepart?: string;
  statut: 'confirmée' | 'en attente' | 'annulée' | 'terminée';
  // Champs enrichis par le backend (relations TypeORM)
  bien?: Bien;
  locataire?: Locataire;
  dateDebut?: string;
  dateFin?: string;
}


export interface EvenementAgenda {
  id: string;
  date: string;
  type: 'entrée' | 'départ';
  locataireId: string;
  bienId: string;
  couleur: string;
}



export type Utilisateur = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  avatar?: string; //URL ou chemin vers l'image 
  formule: 'gratuit' | 'payant';
}