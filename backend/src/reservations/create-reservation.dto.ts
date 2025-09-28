import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Matches, IsOptional } from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  bienId: number;

  @ApiProperty({ example: 'Dupont' })
  @IsString()
  locataireNom: string;

  @ApiProperty({ example: 'Jean' })
  @IsString()
  locatairePrenom: string;

  @ApiProperty({ example: 'jean.dupont@email.com' })
  @IsString()
  locataireEmail: string;

  @ApiProperty({ example: '0601020304' })
  @IsString()
  locataireTelephone: string;

  @ApiProperty({ example: '15/09/2025' })
  @IsString()
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, { message: 'La date doit être au format JJ/MM/AAAA' })
  dateDebut: string;

  @ApiProperty({ example: '30/09/2025' })
  @IsString()
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, { message: 'La date doit être au format JJ/MM/AAAA' })
  dateFin: string;

  @ApiProperty({ example: 'en attente', required: false })
  @IsOptional()
  @IsString()
  statut?: 'en attente' | 'confirmée' | 'terminée' | 'annulée';
}

export class UpdateReservationDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  bienId?: number;

  @ApiProperty({ example: 'Dupont', required: false })
  @IsOptional()
  @IsString()
  locataireNom?: string;

  @ApiProperty({ example: 'Jean', required: false })
  @IsOptional()
  @IsString()
  locatairePrenom?: string;

  @ApiProperty({ example: 'jean.dupont@email.com', required: false })
  @IsOptional()
  @IsString()
  locataireEmail?: string;

  @ApiProperty({ example: '0601020304', required: false })
  @IsOptional()
  @IsString()
  locataireTelephone?: string;

  @ApiProperty({ example: '15/09/2025', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, { message: 'La date doit être au format JJ/MM/AAAA' })
  dateDebut?: string;

  @ApiProperty({ example: '30/09/2025', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, { message: 'La date doit être au format JJ/MM/AAAA' })
  dateFin?: string;

  @ApiProperty({ example: 'en attente', required: false })
  @IsOptional()
  @IsString()
  statut?: 'en attente' | 'confirmée' | 'terminée' | 'annulée';
}
