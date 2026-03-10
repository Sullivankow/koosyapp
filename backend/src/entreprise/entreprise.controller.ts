import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { EntrepriseService } from './entreprise.service';
import { CreateEntrepriseDto, UpdateEntrepriseDto } from './create-entreprise.dto';
import { Entreprise } from './entreprise.entity';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Contrôleur pour gérer les endpoints liés à l'entité Entreprise
@ApiTags('Entreprise')
@ApiBearerAuth() // Documentation Swagger : nécessite un token d'authentification
@UseGuards(JwtAuthGuard) // Tous les endpoints nécessitent que l'utilisateur soit connecté
@Controller('entreprise')
export class EntrepriseController {
  constructor(private readonly entrepriseService: EntrepriseService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une entreprise (authentifié)' })
  async create(@Body() dto: CreateEntrepriseDto): Promise<Entreprise> {
    return this.entrepriseService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une entreprise par ID (authentifié)' })
  async findOne(@Param('id') id: number): Promise<Entreprise | null> {
    return this.entrepriseService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour une entreprise (authentifié)' })
  async update(@Param('id') id: number, @Body() dto: UpdateEntrepriseDto): Promise<Entreprise | null> {
    return this.entrepriseService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une entreprise (authentifié)' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.entrepriseService.remove(id);
  }
}
