import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Min, IsOptional, IsString, IsDateString } from 'class-validator';
import {PartialType} from '@nestjs/mapped-types';


/**
 * DTO utilisé pour la création d'une prestation via l'API.
 * - `amount` attendu en euros (ex: 12.5). Le service convertira en centimes.
 */
export class CreatePrestationDto {
	@ApiProperty({ example: 3, description: 'Identifiant du bien' })
	@IsInt()
	bienId: number;

	@ApiProperty({ example: 12.5, description: "Montant en euros (ex: 12.5 = 12,50€)" })
	@IsNumber({ maxDecimalPlaces: 2 }, { message: 'Le montant doit être un nombre avec au maximum 2 décimales.' })
	@Min(0)
	amount: number;

	@ApiProperty({ example: 'Nettoyage fin de séjour', required: false })
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({ example: '2025-12-10', description: "Date de la prestation (YYYY-MM-DD), optionnel" , required: false})
	@IsOptional()
	@IsDateString()
	date_prestation?: string;

	
	@ApiProperty({ example: 'confirmed', description: 'Statut de la prestation', required: false })
	@IsOptional()
	@IsString()
	status?: string;
}


// DTO pour la mise à jour d'une prestation, tous les champs sont optionnels
export class UpdatePrestationDto {
  @ApiProperty({ example: 3, required: false })
  @IsOptional()
  @IsInt()
  bienId?: number;

  @ApiProperty({ example: 12.5, required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  amount?: number;

  @ApiProperty({ example: 'Nettoyage', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2025-12-10', required: false })
  @IsOptional()
  @IsDateString()
  date_prestation?: string;

  @ApiProperty({ example: 'confirmed', required: false })
  @IsOptional()
  @IsString()
  status?: string;
}