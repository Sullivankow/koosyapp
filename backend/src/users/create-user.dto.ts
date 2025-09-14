import { IsEmail, IsString, MinLength } from 'class-validator';
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

  @ApiProperty({ example: 'premium', required: false })
  abonnement?: 'gratuit' | 'premium';
}


//DTO pour mettre à jour un utilisateur, tous les champs sont optionnels
export class UpdateUserDto {
  @ApiProperty({ example: 'test@example.com' })
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'motdepasse' })
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({ example: 'Dupont' })
  @IsString()
  nom?: string;

  @ApiProperty({ example: 'Jean' })
  @IsString()
  prenom?: string;

    @ApiProperty({ example: 'premium', required: false })
  abonnement?: 'gratuit' | 'premium';
}