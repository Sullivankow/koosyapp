import { Controller, Post, Body, UseGuards, Req, Get, Query } from '@nestjs/common';
import { PrestationService } from './prestation.service';
import { CreatePrestationDto } from './create-prestation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

/**
 * Controller exposant les endpoints REST pour les prestations.
 * - POST /prestations: créer une prestation (auth requis)
 * - GET /prestations: lister (filtre par bien)
 * - GET /prestations/summary: totaux par période
 */
@ApiTags('Prestations')
@Controller('prestations')
export class PrestationController {
	constructor(private readonly service: PrestationService) {}

	@UseGuards(JwtAuthGuard)
	@Post()
	@ApiOperation({ summary: 'Créer une prestation' })
	@ApiResponse({ status: 201, description: 'Prestation créée.' })
	async create(@Body() dto: CreatePrestationDto, @Req() req: any) {
		const userId = req.user?.id;
		return this.service.create(dto, userId);
	}

	@UseGuards(JwtAuthGuard)
	@Get()
	@ApiOperation({ summary: 'Lister les prestations (paginé)' })
	@ApiQuery({ name: 'bienId', required: false })
	@ApiQuery({ name: 'page', required: false })
	@ApiQuery({ name: 'limit', required: false })
	async list(@Query('bienId') bienId?: number, @Query('page') page = '1', @Query('limit') limit = '20') {
		return this.service.list({ bienId: bienId ? Number(bienId) : undefined, page: Number(page), limit: Number(limit) });
	}

	@UseGuards(JwtAuthGuard)
	@Get('summary')
	@ApiOperation({ summary: "Récupérer le chiffre d'affaires agrégé sur une période" })
	@ApiQuery({ name: 'from', required: true })
	@ApiQuery({ name: 'to', required: true })
	async summary(@Query('from') from: string, @Query('to') to: string) {
		return this.service.summary({ from, to });
	}
}

