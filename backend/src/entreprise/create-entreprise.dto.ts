import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';

// DTO pour créer une entreprise
export class CreateEntrepriseDto {
  @ApiProperty({ example: 'SARL Dupont' })
  @IsString()
  nom: string;

  @ApiProperty({ example: '12345678901234' })
  @IsString()
  @MinLength(14)
  @MaxLength(14)
  siret: string;

  @ApiProperty({ example: 'FR12345678901', required: false })
  @IsOptional()
  @IsString()
  tva?: string;

  @ApiProperty({ example: '12 rue de Paris', required: false })
  @IsOptional()
  @IsString()
  adresse?: string;

  @ApiProperty({ example: '75001', required: false })
  @IsOptional()
  @IsString()
  codePostal?: string;

  @ApiProperty({ example: 'Paris', required: false })
  @IsOptional()
  @IsString()
  ville?: string;

  @ApiProperty({ example: 'France', required: false })
  @IsOptional()
  @IsString()
  pays?: string;

  @ApiProperty({ example: 'contact@dupont.fr', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: '+33123456789', required: false })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiProperty({ example: 'https://dupont.fr', required: false })
  @IsOptional()
  @IsString()
  siteWeb?: string;

  @ApiProperty({ example: '/uploads/logo.png', required: false })
  @IsOptional()
  @IsString()
  logo?: string;
}

// DTO pour mettre à jour une entreprise (tous les champs sont optionnels)
export class UpdateEntrepriseDto {
  @ApiProperty({ example: 'SARL Dupont', required: false })
  @IsOptional()
  @IsString()
  nom?: string;

  @ApiProperty({ example: '12345678901234', required: false })
  @IsOptional()
  @IsString()
  @MinLength(14)
  @MaxLength(14)
  siret?: string;

  @ApiProperty({ example: 'FR12345678901', required: false })
  @IsOptional()
  @IsString()
  tva?: string;

  @ApiProperty({ example: '12 rue de Paris', required: false })
  @IsOptional()
  @IsString()
  adresse?: string;

  @ApiProperty({ example: '75001', required: false })
  @IsOptional()
  @IsString()
  codePostal?: string;

  @ApiProperty({ example: 'Paris', required: false })
  @IsOptional()
  @IsString()
  ville?: string;

  @ApiProperty({ example: 'France', required: false })
  @IsOptional()
  @IsString()
  pays?: string;

  @ApiProperty({ example: 'contact@dupont.fr', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: '+33123456789', required: false })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiProperty({ example: 'https://dupont.fr', required: false })
  @IsOptional()
  @IsString()
  siteWeb?: string;

  @ApiProperty({ example: '/uploads/logo.png', required: false })
  @IsOptional()
  @IsString()
  logo?: string;
}
