import { Controller, BadRequestException } from '@nestjs/common';
import { Body, Post, UseGuards, Request, Patch, Param } from '@nestjs/common';
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


}
