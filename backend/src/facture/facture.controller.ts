import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { FactureService } from './facture.service';
import { CreateFactureDto } from './create-facture.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Facture')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('facture')
export class FactureController {
  constructor(private readonly factureService: FactureService) {}

  /**
   * Crée une nouvelle facture pour l'entreprise de l'utilisateur connecté.
   */
  @Post()
  @ApiOperation({ summary: 'Créer une facture', description: 'Crée une nouvelle facture pour l’entreprise de l’utilisateur connecté.' })
  create(@Body() createFactureDto: CreateFactureDto) {
    return this.factureService.create(createFactureDto);
  }

  /**
   * Récupère la liste de toutes les factures accessibles à l'utilisateur connecté.
   */
  @Get()
  @ApiOperation({ summary: 'Lister toutes les factures', description: 'Récupère la liste de toutes les factures accessibles à l’utilisateur connecté.' })
  findAll() {
    return this.factureService.findAll();
  }

  /**
   * Récupère une facture par son identifiant.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une facture par ID', description: 'Récupère une facture par son identifiant.' })
  findOne(@Param('id') id: string) {
    return this.factureService.findOne(+id);
  }

  /**
   * Met à jour une facture existante.
   */
  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour une facture', description: 'Met à jour une facture existante.' })
  update(@Param('id') id: string, @Body() updateFactureDto: CreateFactureDto) {
    return this.factureService.update(+id, updateFactureDto);
  }

  /**
   * Supprime une facture par son identifiant.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une facture', description: 'Supprime une facture par son identifiant.' })
  remove(@Param('id') id: string) {
    return this.factureService.remove(+id);
  }
}
