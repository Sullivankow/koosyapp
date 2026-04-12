import { IsNotEmpty, IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFactureDto {
  @ApiPropertyOptional({ description: 'Numéro unique de la facture' })
  @IsOptional()
  numero?: string;

  @ApiPropertyOptional({ description: 'Date d\'émission', type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  dateEmission?: Date;

  @ApiPropertyOptional({ description: 'Date d\'échéance', type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  dateEcheance?: Date;

  @ApiPropertyOptional({ description: 'Statut de la facture (brouillon, envoyée, payée, etc.)' })
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

  @ApiPropertyOptional({ description: 'Conditions de paiement' })
  @IsOptional()
  @IsString()
  conditionsPaiement?: string;

  @ApiPropertyOptional({ description: 'Notes complémentaires' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Lieu de prestation (adresse ou ville)' })
  @IsOptional()
  @IsString()
  lieuPrestation?: string;

  @ApiProperty({ description: "ID de l'entreprise liée à la facture" })
  @IsNotEmpty()
  entreprise: number; // id de l'entreprise

  @ApiProperty({ description: "ID du propriétaire lié à la facture", required: false })
  @IsOptional()
  proprietaire?: number; // id du propriétaire
}
