
// Fichier de centralisation des types et données mock
// Utilisé temporairement côté front admin en attendant les vraies
// structures de données renvoyées par le backend Nest.

// ---------- Utilisateurs / Propriétaires ----------

// Type représentant un utilisateur Koosy (backoffice / conciergerie)
export type UtilisateurKoosy = {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Collaborateur';
};

// Données mockées pour quelques utilisateurs Koosy
export const mockUsers: UtilisateurKoosy[] = [
  { id: 1, name: 'Clara Leroy', email: 'clara@koosy.app', role: 'Manager' },
  { id: 2, name: 'Yanis Morel', email: 'yanis@koosy.app', role: 'Collaborateur' },
  { id: 3, name: 'Admin Koosy', email: 'admin@koosy.app', role: 'Admin' },
];

// Type représentant un propriétaire (utilisateur Koosy côté biens)
export type Owner = {
  id: number;
  name: string;
  email: string;
};

// Données mockées pour quelques propriétaires
export const mockOwners: Owner[] = [
  { id: 1, name: 'Julie Martin', email: 'julie.martin@example.com' },
  { id: 2, name: 'Samuel Dupont', email: 'samuel.dupont@example.com' },
  { id: 3, name: 'Lina Costa', email: 'lina.costa@example.com' },
];

// ---------- Biens ----------

// Type représentant un bien complet pour la page Biens
export type Bien = {
  id: number;
  name: string;
  city: string;
  country: string;
  type: 'Appartement' | 'Maison' | 'Studio' | 'Chambre';
  // Statut réel côté backend : disponible / occupé / travaux
  status: 'disponible' | 'occupé' | 'travaux';
  occupancyRate: number; // taux d'occupation en % (mock)
  pricePerNight: number; // prix par nuit
  capacity: {
    guests: number;
    bedrooms: number;
    bathrooms: number;
  };
  owner: Owner;
};

// Données mockées pour les biens
export const mockBiens: Bien[] = [
  {
    id: 101,
    name: 'Appartement lumineux centre-ville',
    city: 'Paris',
    country: 'France',
    type: 'Appartement',
    status: 'disponible',
    occupancyRate: 82,
    pricePerNight: 120,
    capacity: { guests: 4, bedrooms: 2, bathrooms: 1 },
    owner: mockOwners[0],
  },
  {
    id: 102,
    name: 'Maison avec jardin',
    city: 'Bordeaux',
    country: 'France',
    type: 'Maison',
    status: 'occupé',
    occupancyRate: 65,
    pricePerNight: 180,
    capacity: { guests: 6, bedrooms: 3, bathrooms: 2 },
    owner: mockOwners[1],
  },
  {
    id: 103,
    name: 'Studio cosy proche plage',
    city: 'Nice',
    country: 'France',
    type: 'Studio',
    status: 'travaux',
    occupancyRate: 0,
    pricePerNight: 75,
    capacity: { guests: 2, bedrooms: 1, bathrooms: 1 },
    owner: mockOwners[2],
  },
];

// Version « légère » d'un bien (utilisée dans réservations / prestations)
export type BienLight = {
  id: number;
  name: string;
  city: string;
  country: string;
};

export const mockBiensLight: BienLight[] = [
  { id: 101, name: 'Appartement lumineux centre-ville', city: 'Paris', country: 'France' },
  { id: 102, name: 'Maison avec jardin', city: 'Bordeaux', country: 'France' },
  { id: 103, name: 'Studio cosy proche plage', city: 'Nice', country: 'France' },
];

// ---------- Réservations ----------

// Type représentant un voyageur (locataire côté séjour)
export type Voyageur = {
  id: number;
  name: string;
  email: string;
  phone: string;
};

export const mockVoyageurs: Voyageur[] = [
  { id: 201, name: 'Emma Durand', email: 'emma.durand@example.com', phone: '+33 6 12 34 56 78' },
  { id: 202, name: 'Léo Martin', email: 'leo.martin@example.com', phone: '+33 6 98 76 54 32' },
  { id: 203, name: 'Sofia Costa', email: 'sofia.costa@example.com', phone: '+351 9 12 34 56 78' },
];

// Statut métier d'une réservation
export type ReservationStatus = 'Brouillon' | 'Confirmée' | 'En cours' | 'Terminée' | 'Annulée';

// Type représentant une réservation
export type Reservation = {
  id: number;
  reference: string;
  property: BienLight;
  traveler: Voyageur;
  checkIn: string; // ISO date
  checkOut: string; // ISO date
  nights: number;
  status: ReservationStatus;
  channel: 'Airbnb' | 'Booking' | 'Direct' | 'Autre';
  totalAmount: number;
  currency: 'EUR';
  // Utilisateur Koosy qui a créé la réservation
  createdBy: UtilisateurKoosy;
  // Utilisateur Koosy responsable du suivi (peut être différent du créateur)
  assignedTo?: UtilisateurKoosy;
};

export const mockReservations: Reservation[] = [
  {
    id: 1,
    reference: 'KOOSY-RES-001',
    property: mockBiensLight[0],
    traveler: mockVoyageurs[0],
    checkIn: '2026-04-10',
    checkOut: '2026-04-15',
    nights: 5,
    status: 'Confirmée',
    channel: 'Airbnb',
    totalAmount: 750,
    currency: 'EUR',
    createdBy: mockUsers[0],
    assignedTo: mockUsers[1],
  },
  {
    id: 2,
    reference: 'KOOSY-RES-002',
    property: mockBiensLight[1],
    traveler: mockVoyageurs[1],
    checkIn: '2026-03-28',
    checkOut: '2026-04-02',
    nights: 5,
    status: 'En cours',
    channel: 'Booking',
    totalAmount: 900,
    currency: 'EUR',
    createdBy: mockUsers[2],
    assignedTo: mockUsers[0],
  },
  {
    id: 3,
    reference: 'KOOSY-RES-003',
    property: mockBiensLight[2],
    traveler: mockVoyageurs[2],
    checkIn: '2026-05-01',
    checkOut: '2026-05-03',
    nights: 2,
    status: 'Brouillon',
    channel: 'Direct',
    totalAmount: 260,
    currency: 'EUR',
    createdBy: mockUsers[1],
  },
];

// ---------- Tâches ----------

// Statut métier d'une tâche
export type TacheStatus = 'À faire' | 'En cours' | 'Terminée' | 'En retard';

// Priorité d'une tâche
export type TachePriority = 'Haute' | 'Moyenne' | 'Basse';

// Type représentant une tâche backoffice / conciergerie
export type Tache = {
  id: number;
  title: string;
  description?: string;
  status: TacheStatus;
  priority: TachePriority;
  // Référence éventuelle liée à une réservation ou à une prestation
  contextType?: 'Réservation' | 'Prestation' | 'Autre';
  contextRef?: string; // ex : "KOOSY-RES-001" ou "PREST-123"
  dueDate: string; // ISO date
  createdAt: string; // ISO date
  createdBy: UtilisateurKoosy;
  assignedTo: UtilisateurKoosy;
};

export const mockTaches: Tache[] = [
  {
    id: 1,
    title: 'Préparer le check-in – Appartement Paris',
    description: 'Vérifier le ménage, déposer le welcome pack, vérifier les clés.',
    status: 'À faire',
    priority: 'Haute',
    contextType: 'Réservation',
    contextRef: 'KOOSY-RES-001',
    dueDate: '2026-04-10',
    createdAt: '2026-03-28',
    createdBy: mockUsers[0],
    assignedTo: mockUsers[1],
  },
  {
    id: 2,
    title: 'Planifier la prestation ménage – Maison Bordeaux',
    description: 'Bloquer un créneau équipe terrain après le check-out.',
    status: 'En cours',
    priority: 'Moyenne',
    contextType: 'Prestation',
    contextRef: 'PREST-452',
    dueDate: '2026-03-30',
    createdAt: '2026-03-25',
    createdBy: mockUsers[2],
    assignedTo: mockUsers[0],
  },
  {
    id: 3,
    title: 'Mettre à jour les coordonnées du propriétaire',
    description: 'Suite à son appel, mettre à jour téléphone + IBAN.',
    status: 'Terminée',
    priority: 'Basse',
    contextType: 'Autre',
    contextRef: 'SUPPORT-2026-014',
    dueDate: '2026-03-20',
    createdAt: '2026-03-18',
    createdBy: mockUsers[1],
    assignedTo: mockUsers[1],
  },
  {
    id: 4,
    title: 'Suivi litige invité – Studio Nice',
    description: 'Vérifier les éléments du litige avant d’appeler la plateforme.',
    status: 'En retard',
    priority: 'Haute',
    contextType: 'Réservation',
    contextRef: 'KOOSY-RES-003',
    dueDate: '2026-03-22',
    createdAt: '2026-03-19',
    createdBy: mockUsers[2],
    assignedTo: mockUsers[0],
  },
];

// ---------- Prestations ----------

// Type de prestation (métier)
export type PrestationType = 'Ménage' | 'Check-in' | 'Check-out' | 'Linge' | 'Maintenance' | 'Autre';

// Statut de la prestation
export type PrestationStatus = 'Planifiée' | 'En cours' | 'Réalisée' | 'Annulée';

// Type représentant une prestation
export type Prestation = {
  id: number;
  type: PrestationType;
  status: PrestationStatus;
  scheduledAt: string; // date/heure prévue au format ISO
  durationMinutes?: number;
  property: BienLight;
  // Réservation liée (optionnelle) – permet de rattacher la prestation à un séjour précis
  reservationRef?: string; // ex : "KOOSY-RES-001"
  // Utilisateur Koosy assigné à la prestation
  assignedTo: UtilisateurKoosy;
  createdBy: UtilisateurKoosy;
  notes?: string;
  // Informations financières optionnelles
  price?: number;
  currency?: 'EUR';
};

export const mockPrestations: Prestation[] = [
  {
    id: 1,
    type: 'Ménage',
    status: 'Planifiée',
    scheduledAt: '2026-04-15T10:00:00',
    durationMinutes: 120,
    property: mockBiensLight[0],
    reservationRef: 'KOOSY-RES-001',
    assignedTo: mockUsers[1],
    createdBy: mockUsers[0],
    notes: 'Ménage complet + changement de linge, vérifier les consommables.',
    price: 60,
    currency: 'EUR',
  },
  {
    id: 2,
    type: 'Check-in',
    status: 'En cours',
    scheduledAt: '2026-03-28T16:30:00',
    property: mockBiensLight[1],
    reservationRef: 'KOOSY-RES-002',
    assignedTo: mockUsers[0],
    createdBy: mockUsers[2],
    notes: 'Accueillir les invités, vérifier identité et état des lieux rapide.',
  },
  {
    id: 3,
    type: 'Maintenance',
    status: 'Réalisée',
    scheduledAt: '2026-03-20T09:00:00',
    durationMinutes: 90,
    property: mockBiensLight[2],
    assignedTo: mockUsers[2],
    createdBy: mockUsers[1],
    notes: 'Réparation robinet salle de bain, prise photo avant/après.',
    price: 120,
    currency: 'EUR',
  },
  {
    id: 4,
    type: 'Check-out',
    status: 'Annulée',
    scheduledAt: '2026-03-22T11:00:00',
    property: mockBiensLight[0],
    reservationRef: 'KOOSY-RES-003',
    assignedTo: mockUsers[1],
    createdBy: mockUsers[0],
    notes: 'Séjour annulé par le voyageur, check-out non nécessaire.',
  },
];
