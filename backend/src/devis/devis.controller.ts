import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { DevisService } from './devis.service';
import { CreateDevisDto } from './create-devis.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('devis')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('devis')
export class DevisController {
  constructor(private readonly devisService: DevisService) {}


  /**
   * Crée un nouveau devis pour l'entreprise de l'utilisateur connecté.
   */
  @Post()
  @ApiOperation({ summary: 'Créer un nouveau devis', description: 'Crée un nouveau devis pour l’entreprise de l’utilisateur connecté.' })
  create(@Body() createDevisDto: CreateDevisDto) {
    return this.devisService.create(createDevisDto);
  }


  /**
   * Récupère la liste de tous les devis accessibles à l'utilisateur connecté.
   */
  @Get()
  @ApiOperation({ summary: 'Lister tous les devis', description: 'Récupère la liste de tous les devis accessibles à l’utilisateur connecté.' })
  findAll() {
    return this.devisService.findAll();
  }


  /**
   * Récupère un devis par son identifiant.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un devis par ID', description: 'Récupère un devis par son identifiant.' })
  findOne(@Param('id') id: string) {
    return this.devisService.findOne(+id);
  }


  /**
   * Met à jour un devis existant.
   */
  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un devis', description: 'Met à jour un devis existant.' })
  update(@Param('id') id: string, @Body() updateDevisDto: CreateDevisDto) {
    return this.devisService.update(+id, updateDevisDto);
  }

  /**
   * Supprime un devis par son identifiant.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un devis', description: 'Supprime un devis par son identifiant.' })
  remove(@Param('id') id: string) {
    return this.devisService.remove(+id);
  }
}
