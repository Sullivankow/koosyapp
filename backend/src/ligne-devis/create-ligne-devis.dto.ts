import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLigneDevisDto {
  @ApiProperty({ description: 'Description de la prestation ou du produit' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Quantité', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  quantite: number;

  @ApiProperty({ description: 'Prix unitaire HT', example: 50.00 })
  @IsNotEmpty()
  @IsNumber()
  prixUnitaireHT: number;

  @ApiProperty({ description: 'Taux TVA en %', example: 20 })
  @IsNumber()
  tauxTVA: number;

  @ApiProperty({ description: 'Total ligne HT', example: 100.00 })
  @IsNotEmpty()
  @IsNumber()
  totalLigneHT: number;

  @ApiProperty({ description: 'Total ligne TTC', example: 120.00 })
  @IsNotEmpty()
  @IsNumber()
  totalLigneTTC: number;

  @ApiProperty({ description: 'ID du devis parent' })
  @IsNotEmpty()
  devis: number;
}
