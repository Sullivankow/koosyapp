import { Controller, Post, Body, UseGuards, Req, Get, Query, Patch, Param, Delete } from '@nestjs/common';
import { PrestationService, PrestationStatus } from './prestation.service';
import { CreatePrestationDto } from './create-prestation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { UpdatePrestationDto } from './create-prestation.dto';
import { ChangeStatusDto } from './create-prestation.dto';




/**
 * Controller exposant les endpoints REST pour les prestations.
 * - POST /prestations: créer une prestation (auth requis)
 * - GET /prestations: lister (filtre par bien)
 * - GET /prestations/summary: totaux par période
 */
@ApiBearerAuth()
@ApiTags('Prestations')
@Controller('prestations')
export class PrestationController {
	constructor(private readonly service: PrestationService) {}


	// Endpoint pour créer une prestation, nécessite une authentification JWT
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Post()
	@ApiOperation({ summary: 'Créer une prestation' })
	@ApiResponse({ status: 201, description: 'Prestation créée.' })
	async create(@Body() dto: CreatePrestationDto, @Req() req: any) {
		const userId = req.user?.id;
		return this.service.create(dto, userId);
	}


	// Endpoint pour lister les prestations, avec pagination et filtre optionnel par bien
	@UseGuards(JwtAuthGuard)
	@Get()
	@ApiOperation({ summary: 'Lister les prestations (paginé)' })
	@ApiQuery({ name: 'bienId', required: false })
	@ApiQuery({ name: 'page', required: false })
	@ApiQuery({ name: 'limit', required: false })
	async list(@Query('bienId') bienId?: number, @Query('page') page = '1', @Query('limit') limit = '20') {
		return this.service.list({ bienId: bienId ? Number(bienId) : undefined, page: Number(page), limit: Number(limit) });
	}



	// Endpoint pour récupérer le chiffre d'affaires agrégé sur une période
	@UseGuards(JwtAuthGuard)
	@Get('summary')
	@ApiOperation({ summary: "Récupérer le chiffre d'affaires agrégé sur une période" })
	@ApiQuery({ name: 'from', required: true })
	@ApiQuery({ name: 'to', required: true })
	async summary(@Query('from') from: string, @Query('to') to: string) {
		return this.service.summary({ from, to });
	}

	// Endpoint pour récupérer le CA mensuel sur une période
	@UseGuards(JwtAuthGuard)
	@Get('monthly-summary')
	@ApiOperation({ summary: "Récupérer le chiffre d'affaires mensuel sur une période" })
	@ApiQuery({ name: 'from', required: true })
	@ApiQuery({ name: 'to', required: true })
	@ApiResponse({ status: 200, description: 'Liste du CA par mois.' })
	async monthlySummary(@Query('from') from: string, @Query('to') to: string) {
		return this.service.monthlySummary({ from, to });
	}

	// Endpoint pour modifier une prestation, nécessite une authentification JWT
	@UseGuards(JwtAuthGuard)
	@Patch(':id')
	@ApiOperation({ summary: 'Modifier une prestation' })
	@ApiResponse({ status: 200, description: 'Prestation modifiée.' })
	async update(@Body() dto: UpdatePrestationDto, @Param('id') id: number, @Req() req: any) {
		return this.service.update(id, dto);
	}

	// Endpoint pour supprimer une prestation, nécessite une authentification JWT
	@UseGuards(JwtAuthGuard)
	@Delete(':id')
	@ApiOperation({ summary: 'Supprimer une prestation' })
	@ApiResponse({ status: 200, description: 'Prestation supprimée.' })
	@ApiResponse({ status: 404, description: 'Prestation non trouvée.' })
	async remove(@Param('id') id: number) {
		return this.service.remove(id);
	}

//Endpoint pour changer le status de la prestation

// Endpoint pour changer le statut d'une prestation
	@UseGuards(JwtAuthGuard)
	@Patch(':id/status')
	@ApiOperation({ summary: 'Changer le statut d\'une prestation' })
	@ApiResponse({ status: 200, description: 'Statut modifié.' })
	@ApiResponse({ status: 400, description: 'Statut invalide.' })
	@ApiResponse({ status: 404, description: 'Prestation non trouvée.' })
	async changeStatus(@Param('id') id: number, @Body() dto: ChangeStatusDto) {
		return this.service.changeStatus(id, dto.status);
	}



// Endpoint pour lister toutes les prestations terminées
	@UseGuards(JwtAuthGuard)
	@Get('terminees')
	@ApiOperation({ summary: 'Lister toutes les prestations terminées' })
	@ApiResponse({ status: 200, description: 'Liste des prestations terminées.' })
	async findAllTerminees() {
		return this.service.findAllTerminees();
	}


}

