import { Controller, BadRequestException } from '@nestjs/common';
import { Body, Post, UseGuards, Request, Patch, Param, Delete,Get } from '@nestjs/common';
import { TachesService } from './taches.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTacheDto, UpdateTacheDto } from './create-tache.dto';
import { ApiBody, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';




@ApiTags('Tâches')
@ApiBearerAuth()
@Controller('taches')
export class TachesController {
  constructor(private tachesService: TachesService) {}


  //Méthode pour crée une tâche liées à un bien spécifique 
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: CreateTacheDto })
  @ApiResponse({ status: 201, description: 'Tâche créée avec succès.' })
  async createTache(@Body() dto: CreateTacheDto, @Request() req) {
    return this.tachesService.createTache(dto, req.user.userId);
  }

//Méthode pour récupérer une tâche la veille de sa date d'échéance
  @Get('rappels')
@UseGuards(JwtAuthGuard)
@ApiResponse({ status: 200, description: 'Liste des tâches à rappeler demain.' })
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
async updateTache(@Param('id') id: string, @Body() dto: UpdateTacheDto) {
  const idNum = Number(id);
  if (!id || isNaN(idNum) || !Number.isInteger(idNum)) {
    throw new BadRequestException("L'id de la tâche doit être un entier valide");
  }
  return this.tachesService.updateTache(idNum, dto);
}


//Méthode pour supprimer toutes les tâches avec le status terminée
@UseGuards(JwtAuthGuard)
@Delete('terminees')
async deleteAllTachesTerminees() {
    return this.tachesService.deleteAllTachesTerminees();
  }


//Méthode pour supprimer une tâche
@Delete(':id')
@UseGuards(JwtAuthGuard)
@ApiResponse({ status: 200, description: 'Tâche supprimée.' })
@ApiResponse({ status: 404, description: 'Tâche non trouvée.' })
async deleteTache(@Param('id') id: string) {
  const idNum = Number(id);
  if (!id || isNaN(idNum) || !Number.isInteger(idNum)) {
    throw new BadRequestException("L'id de la tâche doit être un entier valide");
  }
  return this.tachesService.deleteTache(idNum);
}





}
