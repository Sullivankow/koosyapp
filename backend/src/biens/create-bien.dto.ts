
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

// DTO pour la création d'un bien (le propriétaire est optionnel)
export class CreateBienDto {
	@ApiPropertyOptional({ description: "ID du propriétaire du bien (optionnel)" })
	@IsOptional()
	@IsNumber()
	proprietaire?: number;

	@ApiProperty({ example: 'Appartement T2 centre-ville' })
	@IsString()
	nom: string;

	@ApiProperty({ example: '12 rue des Lilas, Paris' })
	@IsString()
	adresse: string;

	@ApiProperty({ example: 'appartement' })
	@IsString()
	type: string;

	@ApiProperty({ example: 45 })
	@IsNumber()
	superficie: number;

	@ApiProperty({ example: 2 })
	@IsNumber()
	pieces: number;

	@ApiPropertyOptional({ example: ['cuisine équipée', 'balcon'] })
	@IsOptional()
	equipements?: string[];

	@ApiPropertyOptional({ example: ['photo1.jpg', 'photo2.jpg'] })
	@IsOptional()
	photos?: string[];

	@ApiPropertyOptional({ example: 'disponible' })
	@IsOptional()
	statut?: 'disponible' | 'occupé' | 'travaux';

	@ApiPropertyOptional({ example: 48.8566 })
	@IsOptional()
	lat?: number;

	@ApiPropertyOptional({ example: 2.3522 })
	@IsOptional()
	lng?: number;
}


// DTO pour la mise à jour partielle d'un bien
export class UpdateBienDto {
	@ApiProperty({ example: 'Jean Dupont' })
	@IsString()
	proprietaireNom: string;

	@ApiProperty({ example: 'jean.dupont@email.com' })
	@IsString()
	proprietaireEmail: string;

	@ApiProperty({ example: '0601020304', required: false })
	@IsOptional()
	@IsString()
	proprietaireTelephone?: string;

	@ApiProperty({ example: 'Appartement T2 centre-ville' })
	@IsString()
	nom: string;

	@ApiProperty({ example: '12 rue des Lilas, Paris' })
	@IsString()
	adresse: string;

	@ApiProperty({ example: 'appartement' })
	@IsString()
	type: string;

	@ApiProperty({ example: 45 })
	@IsNumber()
	superficie: number;

	@ApiProperty({ example: 2 })
	@IsNumber()
	pieces: number;

	@ApiProperty({ example: ['cuisine équipée', 'balcon'], required: false })
	@IsOptional()
	equipements?: string[];

	@ApiProperty({ example: ['photo1.jpg', 'photo2.jpg'], required: false })
	@IsOptional()
	photos?: string[];

	@ApiProperty({ example: 'disponible', required: false })
	@IsOptional()
	statut?: 'disponible' | 'occupé' | 'travaux';

	@ApiProperty({ example: 48.8566, required: false })
	@IsOptional()
	lat?: number;

	@ApiProperty({ example: 2.3522, required: false })
	@IsOptional()
	lng?: number;
}

// DTO d'édition admin : mêmes champs que la création mais tous optionnels (pour PATCH)!!!
export class UpdateBienAdminDto {
	@ApiPropertyOptional({ description: "ID du propriétaire du bien (optionnel)" })
	@IsOptional()
	@IsNumber()
	proprietaire?: number;

	@ApiPropertyOptional({ example: 'Appartement T2 centre-ville' })
	@IsOptional()
	@IsString()
	nom?: string;

	@ApiPropertyOptional({ example: '12 rue des Lilas, Paris' })
	@IsOptional()
	@IsString()
	adresse?: string;

	@ApiPropertyOptional({ example: 'appartement' })
	@IsOptional()
	@IsString()
	type?: string;

	@ApiPropertyOptional({ example: 45 })
	@IsOptional()
	@IsNumber()
	superficie?: number;

	@ApiPropertyOptional({ example: 2 })
	@IsOptional()
	@IsNumber()
	pieces?: number;

	@ApiPropertyOptional({ example: ['cuisine équipée', 'balcon'] })
	@IsOptional()
	equipements?: string[];

	@ApiPropertyOptional({ example: ['photo1.jpg', 'photo2.jpg'] })
	@IsOptional()
	photos?: string[];

	@ApiPropertyOptional({ example: 'disponible' })
	@IsOptional()
	statut?: 'disponible' | 'occupé' | 'travaux';

	@ApiPropertyOptional({ example: 48.8566 })
	@IsOptional()
	lat?: number;

	@ApiPropertyOptional({ example: 2.3522 })
	@IsOptional()
	lng?: number;
}
