import { IsEmail, IsString, MinLength, MaxLength, ValidateIf } from 'class-validator';
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
  @IsString()
  role?: 'user' | 'admin';

  @ApiProperty({ example: 'premium', required: false })
  abonnement?: 'gratuit' | 'premium';
   
  @ApiProperty({ example: '0601020304', required: false })
  telephone?: string;
}

//DTO pour mettre à jour un utilisateur, tous les champs sont optionnels
export class UpdateUserDto {
  @ApiProperty({ example: 'test@example.com' })
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'motdepasse' })
  @ValidateIf(o => o.password !== undefined)
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({ example: 'Dupont' })
  @IsString()
  nom?: string;

  @ApiProperty({ example: 'Jean' })
  @IsString()
  prenom?: string;

  @ApiProperty({ example: 'admin', required: false, enum: ['user', 'admin'] })
  @IsString()
  role?: 'user' | 'admin';

  @ApiProperty({ example: 'premium', required: false })
  abonnement?: 'gratuit' | 'premium';

  @ApiProperty({ example: '0601020304', required: false })
  telephone?: string;

  @ApiProperty({ example: 1, required: false, description: 'ID de l\'entreprise associée' })
  entreprise?: number;
}