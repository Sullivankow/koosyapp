import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsInt, Matches } from 'class-validator';
import { TacheStatut } from './tache.entity';

export class CreateTacheDto {
	@ApiProperty({ example: 'Nettoyer la cuisine' })
	@IsString()
	titre: string;

	@ApiProperty({ example: 'Nettoyage complet après départ du locataire', required: false })
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({ example: 'à faire', enum: TacheStatut, required: false })
	@IsOptional()
	@IsEnum(TacheStatut)
	statut?: TacheStatut;

	@ApiProperty({ example: 1 })
	@IsInt()
	bienId: number;

	@ApiProperty({ example: '20/09/2025', required: false, description: 'Format JJ/MM/AAAA' })
	@IsOptional()
	@IsString()
	@Matches(/^\d{2}\/\d{2}\/\d{4}$/, { message: 'La date doit être au format JJ/MM/AAAA' })
	dateEcheance?: string;
}

export class UpdateTacheDto {
	@ApiProperty({ example: 'Nettoyer la cuisine' })
	@IsString()
	titre: string;

	@ApiProperty({ example: 'Nettoyage complet après départ du locataire', required: false })
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({ example: 'à faire', enum: TacheStatut, required: false })
	@IsOptional()
	@IsEnum(TacheStatut)
	statut?: TacheStatut;

	@ApiProperty({ example: 1 })
	@IsInt()
	bienId: number;

	@ApiProperty({ example: '20/09/2025', required: false, description: 'Format JJ/MM/AAAA' })
	@IsOptional()
	@IsString()
	@Matches(/^\d{2}\/\d{2}\/\d{4}$/, { message: 'La date doit être au format JJ/MM/AAAA' })
	dateEcheance?: string;



}