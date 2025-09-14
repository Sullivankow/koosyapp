
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateBienDto {
@ApiProperty({ example: 'Jean Dupont' })
	@IsString()
	proprietaireNom: string;

	@ApiProperty({ example: 'jean.dupont@email.com' })
	@IsString()
	proprietaireEmail: string;

	@ApiProperty({ example: '0601020304' })
	@IsString()
	proprietaireTelephone: string;

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
