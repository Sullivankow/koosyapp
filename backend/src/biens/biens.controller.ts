import { Controller, Post, Body, UseGuards, Request, Get, Delete, Patch, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { BiensService } from './biens.service';
import { CreateBienDto } from './create-bien.dto';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags, ApiQuery, ApiOperation } from '@nestjs/swagger';


import { UpdateBienDto } from './create-bien.dto';

@ApiTags('Biens')
@ApiBearerAuth()
@Controller('biens')
export class BiensController {
 
  constructor(private readonly biensService: BiensService) {}


  //Création d'un bien, uniquement pour les utilisateurs authentifiés

   @Post()
  @ApiBearerAuth()
  @ApiBody({ type: CreateBienDto })
  @ApiResponse({ status: 201, description: 'Bien créé avec succès.' })
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Créer un bien (utilisateur authentifié)' })
  async createBien(@Body() createBienDto: CreateBienDto, @Request() req) {
    return this.biensService.createBien(createBienDto, req.user.userId);
  }

  // Création d'un bien pour un utilisateur donné (réservé aux administrateurs)
  @Post('admin/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBody({ type: CreateBienDto })
  @ApiResponse({ status: 201, description: "Bien créé pour l'utilisateur ciblé (admin)." })
  @ApiResponse({ status: 400, description: "Données invalides ou identifiant utilisateur invalide." })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès réservé aux administrateurs.' })
  @ApiOperation({ summary: "Créer un bien pour un utilisateur donné (admin)" })
  async createBienForUser(
    @Param('userId') userId: string,
    @Body() createBienDto: CreateBienDto,
  ) {
    const idNum = Number(userId);
    if (!userId || isNaN(idNum) || !Number.isInteger(idNum)) {
      throw new BadRequestException("L'id de l'utilisateur doit être un entier valide");
    }
    return this.biensService.createBien(createBienDto, idNum);
  }

  //Méthode pour géocoder une adresse en latitude et longitude
  @Get('geocode')
  @ApiOperation({ summary: 'Géocoder une adresse en latitude/longitude' })
  async geocodeAdresse(@Query('adresse') adresse: string) {
    if (!adresse) {
      throw new BadRequestException('Adresse requise');
    }
    return await this.biensService.geocodeAdresse(adresse);
  }

// Affiche la liste des biens de l'utilisateur connecté
@UseGuards(JwtAuthGuard)
@Get()
@ApiResponse({ status: 200, description: 'Liste des biens de l’utilisateur connecté.' })
@ApiOperation({ summary: 'Afficher la liste des biens de l’utilisateur connecté' })
async getAllBiens(@Request() req) {
  return this.biensService.getAllBiens(req.user.userId);
}

// Affiche la liste complète de tous les biens (réservé aux administrateurs)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Get('admin')
@ApiResponse({ status: 200, description: 'Liste de tous les biens en base (admin).' })
@ApiResponse({ status: 401, description: 'Non authentifié.' })
@ApiResponse({ status: 403, description: 'Accès réservé aux administrateurs.' })
@ApiOperation({ summary: 'Afficher la liste complète de tous les biens (admin)' })
async getAllBiensAdmin() {
  return this.biensService.getAllBiensAdmin();
}

  //Méthode pour compter le nombre total de réservations
@Get('count')
@UseGuards(JwtAuthGuard)
@ApiResponse({ status: 200, description: 'Nombre total de biens.' })
@ApiResponse({ status: 401, description: 'Non authentifié.' })
@ApiOperation({ summary: 'Compter le nombre total de biens de l’utilisateur connecté' })
async getBiensCount(@Request() req) {
  // Utilise l'ID de l'utilisateur connecté
  return { total: await this.biensService.countBiens(req.user.userId) };
}




//Méthode pour rechercher un bien par mot clé (LIKE)

    @Get('search')
    @UseGuards(JwtAuthGuard)
    @ApiQuery({ name: 'motCle', required: true, description: 'Mot clé à rechercher dans le nom du bien' })
    @ApiResponse({ status: 200, description: 'Biens trouvés.' })
    @ApiResponse({ status: 400, description: 'Paramètre motCle manquant.' })
    @ApiResponse({ status: 404, description: 'Aucun bien trouvé.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 500, description: 'Erreur serveur.' })
    @ApiOperation({ summary: 'Rechercher un bien par mot clé' })
    async searchBiens(@Query('motCle') motCle: string) {
      if (!motCle || motCle.trim() === '') {
        throw new BadRequestException('Le paramètre motCle est requis');
      }
      const biens = await this.biensService.findByMotCle(motCle);
      if (!biens || biens.length === 0) {
        throw new NotFoundException('Aucun bien trouvé avec ce mot clé');
      }
      return biens;
    }



  // Affiche un bien par son id (accessible à l'utilisateur connecté)

   @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiResponse({ status: 200, description: 'Bien trouvé.' })
  @ApiResponse({ status: 404, description: 'Bien non trouvé.' })
  @ApiOperation({ summary: 'Afficher un bien par son id (utilisateur connecté)' })
  async getBienById(@Request() req, @Param('id') id: string) {
    const idNum = Number(id);
    if (!id || isNaN(idNum) || !Number.isInteger(idNum)) {
      throw new BadRequestException("L'id du bien doit être un entier valide");
    }
    return this.biensService.getBienById(idNum, req.user.userId);
  }


  


    // Modification d'un bien par son id (utilisateur connecté)

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBody({ type: UpdateBienDto })
  @ApiResponse({ status: 200, description: 'Bien mis à jour.' })
  @ApiResponse({ status: 404, description: 'Bien non trouvé.' })
  @ApiOperation({ summary: 'Modifier un bien par son id (utilisateur connecté)' })
  async updateBien(
    @Request() req,
    @Param('id') id: string,
    @Body() updateBienDto: UpdateBienDto
  ) {
    return this.biensService.updateBien(Number(id), req.user.userId, updateBienDto);
  }

//Méthode pour ajouter ou mettre à jour une remarque sur un bien *

@ApiBody({ schema: { type: 'object', properties: { remarque: { type: 'string' } } } })
@Patch(':id/remarque')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Ajouter ou modifier une remarque sur un bien' })
async addOrUpdateRemarque(@Param('id') id: string, @Body('remarque') remarque: string) {
  return this.biensService.addOrUpdateRemarqueBien(Number(id), remarque);
}


//Méthode pour supprimer une remarque dans un bien

@Delete(':id/remarque')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Supprimer une remarque sur un bien' })
async deleteRemarque(@Param('id') id: string) {
  return this.biensService.deleteRemarqueBien(Number(id));
}




//Suppression d'un bien par son id (utilisateur doit être connecté)

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiResponse({ status: 204, description: 'Bien supprimé.' })
  @ApiResponse({ status: 404, description: 'Bien non trouvé.' })
  @ApiOperation({ summary: 'Supprimer un bien par son id (utilisateur connecté)' })
  async deleteBien(@Request() req, @Param('id') id: string) {
    await this.biensService.deleteBien(Number(id), req.user.userId);
    return { success: true };
  }

// Suppression d'un bien par son id (réservé aux administrateurs)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Delete('admin/:id')
@ApiResponse({ status: 200, description: 'Bien supprimé (admin).' })
@ApiResponse({ status: 401, description: 'Non authentifié.' })
@ApiResponse({ status: 403, description: 'Accès réservé aux administrateurs.' })
@ApiResponse({ status: 404, description: 'Bien non trouvé.' })
@ApiOperation({ summary: 'Supprimer n\'importe quel bien (admin)' })
async deleteBienAdmin(@Param('id') id: string) {
  const idNum = Number(id);
  if (!id || isNaN(idNum) || !Number.isInteger(idNum)) {
    throw new BadRequestException("L'id du bien doit être un entier valide");
  }
  await this.biensService.deleteBienAdmin(idNum);
  return { success: true };
}




}
