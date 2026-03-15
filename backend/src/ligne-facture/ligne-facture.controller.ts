import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { LigneFactureService } from './ligne-facture.service';
import { CreateLigneFactureDto } from './create-ligne-facture.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Ligne-facture')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ligne-facture')
export class LigneFactureController {
  constructor(private readonly ligneFactureService: LigneFactureService) {}

  /**
   * Crée une nouvelle ligne de facture.
   */
  @Post()
  @ApiOperation({ summary: 'Créer une ligne de facture', description: 'Ajoute une nouvelle ligne à une facture existante.' })
  create(@Body() createLigneFactureDto: CreateLigneFactureDto) {
    return this.ligneFactureService.create(createLigneFactureDto);
  }

  /**
   * Liste toutes les lignes de facture.
   */
  @Get()
  @ApiOperation({ summary: 'Lister toutes les lignes de facture', description: 'Récupère toutes les lignes de toutes les factures.' })
  findAll() {
    return this.ligneFactureService.findAll();
  }

  /**
   * Récupère une ligne de facture par son identifiant.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une ligne de facture', description: 'Récupère une ligne de facture par son identifiant.' })
  findOne(@Param('id') id: string) {
    return this.ligneFactureService.findOne(+id);
  }

  /**
   * Met à jour une ligne de facture existante.
   */
  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour une ligne de facture', description: 'Met à jour une ligne de facture existante.' })
  update(@Param('id') id: string, @Body() updateLigneFactureDto: CreateLigneFactureDto) {
    return this.ligneFactureService.update(+id, updateLigneFactureDto);
  }

  /**
   * Supprime une ligne de facture par son identifiant.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une ligne de facture', description: 'Supprime une ligne de facture par son identifiant.' })
  remove(@Param('id') id: string) {
    return this.ligneFactureService.remove(+id);
  }
}
