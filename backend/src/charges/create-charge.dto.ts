import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

// DTO d'entrée pour créer une charge depuis la modale front.
export class CreateChargeDto {
  @ApiProperty({ example: 'Abonnement logiciel planning' })
  @IsString()
  @MaxLength(255)
  libelle: string;

  @ApiProperty({ example: 49.99, description: 'Montant en euros' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ example: '2026-04-12' })
  @IsOptional()
  @IsString()
  // Le front peut envoyer JJ/MM/AAAA ou YYYY-MM-DD.
  date_charge?: string;

  @ApiPropertyOptional({ example: 'Logiciels' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  categorie?: string;

  @ApiPropertyOptional({ example: 'Renouvellement annuel' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateChargeDto {
  @ApiPropertyOptional({ example: 'Abonnement logiciel planning' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  libelle?: string;

  @ApiPropertyOptional({ example: 49.99, description: 'Montant en euros' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ example: '2026-04-12' })
  @IsOptional()
  @IsString()
  date_charge?: string;

  @ApiPropertyOptional({ example: 'Logiciels' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  categorie?: string;

  @ApiPropertyOptional({ example: 'Renouvellement annuel' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ChargeSummaryQueryDto {
  // Les filtres de période restent en ISO pour simplifier les requêtes SQL.
  @ApiProperty({ example: '2026-01-01' })
  @IsString()
  from: string;

  @ApiProperty({ example: '2026-12-31' })
  @IsString()
  to: string;
}
