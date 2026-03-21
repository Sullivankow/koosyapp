import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ProprietaireService } from './proprietaire.service';
import { CreateProprietaireDto, UpdateProprietaireDto } from './create-proprietaire.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Proprietaire')
@Controller('proprietaire')
export class ProprietaireController {
	constructor(private readonly proprietaireService: ProprietaireService) {}

	@Post()
	@ApiOperation({ summary: 'Créer un propriétaire', description: 'Crée un nouveau propriétaire.' })
	create(@Body() dto: CreateProprietaireDto) {
		return this.proprietaireService.create(dto);
	}

	@Get()
	@ApiOperation({ summary: 'Lister tous les propriétaires', description: 'Récupère la liste de tous les propriétaires.' })
	findAll() {
		return this.proprietaireService.findAll();
	}

	@Get(':id')
	@ApiOperation({ summary: 'Obtenir un propriétaire par ID', description: 'Récupère un propriétaire par son identifiant.' })
	findOne(@Param('id') id: string) {
		return this.proprietaireService.findOne(+id);
	}

		       @Put(':id')
		       @ApiOperation({ summary: 'Mettre à jour un propriétaire', description: 'Met à jour un propriétaire existant.' })
		       update(@Param('id') id: string, @Body() dto: UpdateProprietaireDto) {
			       return this.proprietaireService.update(+id, dto);
		       }

	@Delete(':id')
	@ApiOperation({ summary: 'Supprimer un propriétaire', description: 'Supprime un propriétaire par son identifiant.' })
	remove(@Param('id') id: string) {
		return this.proprietaireService.remove(+id);
	}
}
