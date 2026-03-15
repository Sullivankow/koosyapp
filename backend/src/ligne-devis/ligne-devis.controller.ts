import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { LigneDevisService } from './ligne-devis.service';
import { CreateLigneDevisDto } from './create-ligne-devis.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Ligne-devis')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ligne-devis')
export class LigneDevisController {
  constructor(private readonly ligneDevisService: LigneDevisService) {}

  /**
   * Crée une nouvelle ligne de devis.
   */
  @Post()
  @ApiOperation({ summary: 'Créer une ligne de devis', description: 'Ajoute une nouvelle ligne à un devis existant.' })
  create(@Body() createLigneDevisDto: CreateLigneDevisDto) {
    return this.ligneDevisService.create(createLigneDevisDto);
  }

  /**
   * Liste toutes les lignes de devis.
   */
  @Get()
  @ApiOperation({ summary: 'Lister toutes les lignes de devis', description: 'Récupère toutes les lignes de tous les devis.' })
  findAll() {
    return this.ligneDevisService.findAll();
  }

  /**
   * Récupère une ligne de devis par son identifiant.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une ligne de devis', description: 'Récupère une ligne de devis par son identifiant.' })
  findOne(@Param('id') id: string) {
    return this.ligneDevisService.findOne(+id);
  }

  /**
   * Met à jour une ligne de devis existante.
   */
  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour une ligne de devis', description: 'Met à jour une ligne de devis existante.' })
  update(@Param('id') id: string, @Body() updateLigneDevisDto: CreateLigneDevisDto) {
    return this.ligneDevisService.update(+id, updateLigneDevisDto);
  }

  /**
   * Supprime une ligne de devis par son identifiant.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une ligne de devis', description: 'Supprime une ligne de devis par son identifiant.' })
  remove(@Param('id') id: string) {
    return this.ligneDevisService.remove(+id);
  }
}
