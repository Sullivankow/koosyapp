// Type pour la création d'un devis (payload front → back)
export type CreateDevisPayload = Omit<Devis, 'id' | 'dateCreation' | 'statut' | 'proprietaire'> & { proprietaire: number };

export interface Proprietaire {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  adresse: string;
  telephone: string;
}


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
  geo?: { lat: number; lng: number };
  lat?: number;
  lng?: number;
  statut: 'disponible' | 'occupé' | 'travaux';
  historique: any[];
  proprio: Proprio;
  commentaires?: Commentaire[];
  dateCreation: string;
  reservations?: Reservation[];
  prestations?: Prestation[];
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

export interface Entreprise {
  id: number;
  nom: string;
  siret: string;
  tva?: string;
  adresse?: string;
  codePostal?: string;
  ville?: string;
  pays?: string;
  email?: string;
  telephone?: string;
  siteWeb?: string;
  logo?: string;
}



export interface Prestation {
  id: number;
  bien: Bien;
  user?: Utilisateur; // utilisateur ou conciergerie
  description?: string;
  amount_cents: number;
  currency: string;
  date_prestation: string;
  status: string;
  created_at: string;
  updated_at: string;
}


// === Devis & Facture ===

export interface Devis {
  id: number;
  numero: string;
  dateCreation: string;
  dateValidite?: string;
  statut: 'brouillon' | 'envoyé' | 'accepté' | 'refusé' | 'expiré';
  montantHT: number;
  montantTVA: number;
  montantTTC: number;
  conditions?: string;
  notes?: string;
  entreprise: Entreprise;
  proprietaire: Proprietaire;
  lignes?: LigneDevis[];
}

export interface Facture {
  id: number;
  numero: string;
  dateEmission: string;
  dateEcheance?: string;
  statut: 'brouillon' | 'envoyée' | 'payée' | 'en retard' | 'annulée';
  montantHT: number;
  montantTVA: number;
  montantTTC: number;
  conditionsPaiement?: string;
  notes?: string;
  entreprise: Entreprise;
  lignes?: LigneFacture[];
}


export interface LigneDevis {
  id: number;
  description: string;
  quantite: number;
  prixUnitaireHT: number;
  tva: number;
  totalLigneHT: number;
  totalLigneTTC: number;
  devis?: Devis;
}

export interface LigneFacture {
  id: number;
  description: string;
  quantite: number;
  prixUnitaireHT: number;
  tva: number;
  totalLigneHT: number;
  totalLigneTTC: number;
  facture?: Facture;
}