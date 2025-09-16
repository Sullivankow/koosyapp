import { Controller } from '@nestjs/common';
import { Body, Post, UseGuards, Request } from '@nestjs/common';
import { TachesService } from './taches.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTacheDto } from './create-tache.dto';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

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


}
