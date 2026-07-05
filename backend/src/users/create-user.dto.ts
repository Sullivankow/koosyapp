import { IsDateString, IsEmail, IsIn, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';



//DTO pour créer un utilisateur 
export class CreateUserDto {
  @ApiProperty({ example: 'test@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'motdepasse' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Dupont' })
  @IsString()
  nom: string;

  @ApiProperty({ example: 'Jean' })
  @IsString()
  prenom: string;

  @ApiProperty({ example: 'admin', required: false, enum: ['user', 'admin'] })
  @IsOptional()
  @IsString()
  @IsIn(['user', 'admin'])
  role?: 'user' | 'admin';

  @ApiProperty({ example: 'premium', required: false, enum: ['gratuit', 'premium'] })
  @IsOptional()
  @IsString()
  @IsIn(['gratuit', 'premium'])
  abonnement?: 'gratuit' | 'premium';
   
  @ApiProperty({ example: '0601020304', required: false })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiProperty({ example: '2026-05-06T00:00:00.000Z', required: false, description: 'Date de fin d’accès bêta' })
  @IsOptional()
  @IsDateString()
  betaAccessUntil?: string;
}

//DTO pour mettre à jour un utilisateur, tous les champs sont optionnels
export class UpdateUserDto {
  @ApiProperty({ example: 'test@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'motdepasse' })
  @ValidateIf(o => o.password !== undefined)
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({ example: 'Dupont' })
  @IsOptional()
  @IsString()
  nom?: string;

  @ApiProperty({ example: 'Jean' })
  @IsOptional()
  @IsString()
  prenom?: string;

  @ApiProperty({ example: 'admin', required: false, enum: ['user', 'admin'] })
  @IsOptional()
  @IsString()
  @IsIn(['user', 'admin'])
  role?: 'user' | 'admin';

  @ApiProperty({ example: 'premium', required: false, enum: ['gratuit', 'premium'] })
  @IsOptional()
  @IsString()
  @IsIn(['gratuit', 'premium'])
  abonnement?: 'gratuit' | 'premium';

  @ApiProperty({ example: '0601020304', required: false })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiProperty({ example: '2026-05-06T00:00:00.000Z', required: false, description: 'Date de fin d’accès bêta' })
  @IsOptional()
  @IsDateString()
  betaAccessUntil?: string;

  @ApiProperty({ example: 1, required: false, description: 'ID de l\'entreprise associée' })
  entreprise?: number;
}
