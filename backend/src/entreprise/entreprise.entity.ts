import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';

// Entité représentant une entreprise pour la gestion des factures
@Entity()
export class Entreprise {
  @PrimaryGeneratedColumn()
  id: number;

  // Raison sociale de l'entreprise
  @Column()
  nom: string;

  // Numéro SIRET (14 chiffres)
  @Column({ unique: true })
  siret: string;

  // Numéro SIREN (9 chiffres, dérivé du SIRET)
  // Nullable pour compatibilité avec les anciennes lignes déjà en base.
  @Column({ unique: true, nullable: true })
  siren: string;

  // Code APE/NAF (5 caractères)
  @Column({ nullable: true })
  codeAPE: string;

  // Numéro de TVA (optionnel)
  @Column({ nullable: true })
  tva: string;

  // Adresse complète
  @Column({ nullable: true })
  adresse: string;

  // Code postal
  @Column({ nullable: true })
  codePostal: string;

  // Ville
  @Column({ nullable: true })
  ville: string;

  // Pays
  @Column({ nullable: true })
  pays: string;

  // Email professionnel
  @Column({ nullable: true })
  email: string;

  // Téléphone professionnel
  @Column({ nullable: true })
  telephone: string;

  // Site web (optionnel)
  @Column({ nullable: true })
  siteWeb: string;

  // Logo (optionnel, chemin ou url)
  @Column({ nullable: true })
  logo: string;
}
