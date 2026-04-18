import { Controller, Get, Post, Body, Param, Delete, Put, Request, UseGuards } from '@nestjs/common';
import { ProprietaireService } from './proprietaire.service';
import { CreateProprietaireDto, UpdateProprietaireDto } from './create-proprietaire.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Proprietaire')
@Controller('proprietaire')
export class ProprietaireController {
	constructor(private readonly proprietaireService: ProprietaireService) {}

	/**
	 * Crée un propriétaire pour l'utilisateur connecté (quota appliqué).
	 */
	@Post()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Créer un propriétaire', description: 'Crée un nouveau propriétaire.' })
	create(@Body() dto: CreateProprietaireDto, @Request() req) {
		return this.proprietaireService.create(dto, req.user.userId);
	}

	/**
	 * Liste tous les propriétaires de l'utilisateur connecté.
	 */
	@Get()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Lister tous les propriétaires', description: 'Récupère la liste de tous les propriétaires.' })
	findAll(@Request() req) {
		return this.proprietaireService.findAll(req.user.userId);
	}

	/**
	 * Récupère un propriétaire par son ID (appartenant à l'utilisateur connecté).
	 */
	@Get(':id')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Obtenir un propriétaire par ID', description: 'Récupère un propriétaire par son identifiant.' })
	findOne(@Param('id') id: string, @Request() req) {
		return this.proprietaireService.findOne(+id, req.user.userId);
	}

	/**
	 * Endpoint pour obtenir le quota de propriétaires de l'utilisateur connecté.
	 */
	@Get('quota/info')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Récupérer le quota de propriétaires', description: 'Renvoie le quota de propriétaires pour l’utilisateur connecté.' })
	getProprietaireQuota(@Request() req) {
		return this.proprietaireService.getProprietaireQuota(req.user.userId);
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
