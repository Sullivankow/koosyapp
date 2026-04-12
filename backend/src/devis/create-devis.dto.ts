import { IsNotEmpty, IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDevisDto {
  @ApiPropertyOptional({ description: 'Numéro unique du devis' })
  @IsOptional()
  numero?: string;

  @ApiPropertyOptional({ description: 'Date de validité du devis', type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  dateValidite?: Date;

  @ApiPropertyOptional({ description: 'Statut du devis (brouillon, envoyé, accepté, etc.)' })
  @IsOptional()
  @IsString()
  statut?: string;

  @ApiPropertyOptional({ description: 'Montant hors taxes', type: Number, example: 100.00 })
  @IsOptional()
  @IsNumber()
  montantHT?: number;

  @ApiPropertyOptional({ description: 'Montant TVA', type: Number, example: 20.00 })
  @IsOptional()
  @IsNumber()
  montantTVA?: number;

  @ApiPropertyOptional({ description: 'Montant TTC', type: Number, example: 120.00 })
  @IsOptional()
  @IsNumber()
  montantTTC?: number;

  @ApiPropertyOptional({ description: 'Conditions du devis' })
  @IsOptional()
  @IsString()
  conditions?: string;

  @ApiPropertyOptional({ description: 'Notes complémentaires' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Lieu de prestation (adresse ou ville)' })
  @IsOptional()
  @IsString()
  lieuPrestation?: string;

  @ApiProperty({ description: "ID de l'entreprise liée au devis" })
  @IsNotEmpty()
  entreprise: number; // id de l'entreprise

  @ApiProperty({ description: "ID du propriétaire lié au devis" })
  @IsNotEmpty()
  proprietaire: number; // id du propriétaire
}
