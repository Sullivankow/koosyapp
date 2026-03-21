import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProprietaireDto {
	@ApiProperty({ description: 'Nom du propriétaire' })
	@IsNotEmpty()
	@IsString()
	nom: string;

	@ApiProperty({ description: 'Prénom du propriétaire' })
	@IsNotEmpty()
	@IsString()
	prenom: string;

	@ApiProperty({ description: 'Adresse email du propriétaire' })
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@ApiProperty({ description: 'Adresse postale du propriétaire' })
	@IsNotEmpty()
	@IsString()
	adresse: string;

	@ApiProperty({ description: 'Numéro de téléphone du propriétaire' })
	@IsNotEmpty()
	@IsString()
	telephone: string;
}

import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProprietaireDto {
	@ApiPropertyOptional({ description: 'Nom du propriétaire' })
	@IsOptional()
	@IsString()
	nom?: string;

	@ApiPropertyOptional({ description: 'Prénom du propriétaire' })
	@IsOptional()
	@IsString()
	prenom?: string;

	@ApiPropertyOptional({ description: 'Adresse email du propriétaire' })
	@IsOptional()
	@IsEmail()
	email?: string;

	@ApiPropertyOptional({ description: 'Adresse postale du propriétaire' })
	@IsOptional()
	@IsString()
	adresse?: string;

	@ApiPropertyOptional({ description: 'Numéro de téléphone du propriétaire' })
	@IsOptional()
	@IsString()
	telephone?: string;
}
