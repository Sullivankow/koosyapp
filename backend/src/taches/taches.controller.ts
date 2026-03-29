import { Controller, BadRequestException } from '@nestjs/common';
import { Body, Post, UseGuards, Request, Patch, Param, Delete,Get, Query } from '@nestjs/common';
import { TachesService } from './taches.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateTacheDto, UpdateTacheDto } from './create-tache.dto';
import { ApiBody, ApiResponse, ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TacheStatut } from './tache.entity';



@ApiTags('Tâches')
@ApiBearerAuth()
@Controller('taches')
export class TachesController {
  constructor(private tachesService: TachesService) {}








//Méthode pour récupérer la liste de toutes les tâches pour l’utilisateur connecté
@Get()
@UseGuards(JwtAuthGuard)
@ApiResponse({ status: 200, description: 'Liste de toutes les tâches de l’utilisateur connecté.' })
@ApiOperation({ summary: 'Récupérer la liste de toutes les tâches pour l’utilisateur connecté' })
async getAllTaches(@Request() req) {
  const userId = req.user.userId;
  return this.tachesService.getAllTaches(userId);
}

//Méthode admin pour récupérer la liste de toutes les tâches en base
@Get('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiResponse({ status: 200, description: 'Liste de toutes les tâches en base (admin).' })
@ApiResponse({ status: 401, description: 'Non authentifié.' })
@ApiResponse({ status: 403, description: 'Accès réservé aux administrateurs.' })
@ApiOperation({ summary: 'Récupérer la liste totale de toutes les tâches (admin)' })
async getAllTachesAdmin() {
  return this.tachesService.getAllTachesAdmin();
}


  //Méthode pour crée une tâche liées à un bien spécifique 
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: CreateTacheDto })
  @ApiResponse({ status: 201, description: 'Tâche créée avec succès.' })
  @ApiOperation({ summary: 'Créer une tâche liée à un bien spécifique' })
  async createTache(@Body() dto: CreateTacheDto, @Request() req) {
    return this.tachesService.createTache(dto, req.user.userId);
  }


//Méthode pour récupérer une tâche la veille de sa date d'échéance
  @Get('rappels')
@UseGuards(JwtAuthGuard)
@ApiResponse({ status: 200, description: 'Liste des tâches à rappeler demain.' })
@ApiOperation({ summary: 'Récupérer les tâches à rappeler demain pour l’utilisateur connecté' })
async getRappelsTaches(@Request() req) {
  // Récupère l’id de l’utilisateur connecté (conciergerie)
  const userId = req.user.userId;
  // Filtre les tâches à rappeler pour ce user
  const taches = await this.tachesService.getTachesRappelPourDemain();
  return taches.filter(tache => tache.bien.conciergerie.id === userId);
}



  //Méthode pour mettre à jour une tâche existante
  @Patch(':id')
@UseGuards(JwtAuthGuard)
@ApiBody({ type: UpdateTacheDto })
@ApiResponse({ status: 200, description: 'Tâche mise à jour.' })
@ApiResponse({ status: 404, description: 'Tâche non trouvée.' })
@ApiOperation({ summary: 'Mettre à jour une tâche existante' })
async updateTache(@Param('id') id: string, @Body() dto: UpdateTacheDto) {
  const idNum = Number(id);
  if (!id || isNaN(idNum) || !Number.isInteger(idNum)) {
    throw new BadRequestException("L'id de la tâche doit être un entier valide");
  }
  return this.tachesService.updateTache(idNum, dto);
}


//Méthode pour marquer une tâche comme terminée
@Patch(':id/terminee')
@UseGuards(JwtAuthGuard)
@ApiResponse({ status: 200, description: 'Tâche marquée comme terminée.' })
@ApiOperation({ summary: 'Marquer une tâche comme terminée' })
async markTacheAsTerminee(@Param('id') id: string) {
  const idNum = Number(id);
  if (!id || isNaN(idNum) || !Number.isInteger(idNum)) {
    throw new BadRequestException("L'id de la tâche doit être un entier valide");
  }
  return this.tachesService.markTacheAsTerminee(idNum);
}




//Méthode pour supprimer toutes les tâches avec le status terminée
@UseGuards(JwtAuthGuard)
@Delete('terminees')
@ApiOperation({ summary: 'Supprimer toutes les tâches terminées' })
async deleteAllTachesTerminees() {
    return this.tachesService.deleteAllTachesTerminees();
  }



//Méthode pour supprimer une tâche
@Delete(':id')
@UseGuards(JwtAuthGuard)
@ApiResponse({ status: 200, description: 'Tâche supprimée.' })
@ApiResponse({ status: 404, description: 'Tâche non trouvée.' })
@ApiOperation({ summary: 'Supprimer une tâche par son id' })
async deleteTache(@Param('id') id: string) {
  const idNum = Number(id);
  if (!id || isNaN(idNum) || !Number.isInteger(idNum)) {
    throw new BadRequestException("L'id de la tâche doit être un entier valide");
  }
  return this.tachesService.deleteTache(idNum);
}






//Méthode pour compter les tâches "à faire" pour une date donnée
@Get('count-a-faire')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Compter les tâches à faire pour une date donnée' })
async countTachesAFaire(@Request() req, @Query('date') date: string) {
  const userId = req.user.userId;
  return { count: await this.tachesService.countTachesAFairePourDate(date, userId) };
}



//Méthode pour compter le nombre total de tâches "à faire" pour un utilisateur donné
@Get('count-a-faire-total')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Compter le nombre total de tâches à faire pour l’utilisateur connecté' })
async countTachesAFaireTotal(@Request() req) {
  const userId = req.user.userId;
  return { total: await this.tachesService.countTachesAFaireTotal(userId) };
}



 // Méthode pour changer le statut d'une tâche (à faire, en cours, terminée...)
  @Patch(':id/statut')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ schema: { properties: { statut: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Statut de la tâche mis à jour.' })
  @ApiOperation({ summary: 'Changer le statut d’une tâche' })
  async updateTacheStatut(@Param('id') id: string, @Body() body: { statut: string }) {
    const idNum = Number(id);
    if (!id || isNaN(idNum) || !Number.isInteger(idNum)) {
      throw new BadRequestException("L'id de la tâche doit être un entier valide");
    }
    const statut = body.statut;
    const statutEnum = (<any>TacheStatut)[statut] || statut;
    if (!Object.values(TacheStatut).includes(statutEnum)) {
      throw new BadRequestException('Statut invalide');
    }
    return this.tachesService.updateTacheStatut(idNum, statutEnum as TacheStatut);
  }



}
