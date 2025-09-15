import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Matches, IsOptional } from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  bienId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  locataireId: number;

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