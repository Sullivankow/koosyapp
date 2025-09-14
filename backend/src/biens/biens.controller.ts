import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BiensService } from './biens.service';
import { CreateBienDto } from './create-bien.dto';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('biens')
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
  async createBien(@Body() createBienDto: CreateBienDto, @Request() req) {
    return this.biensService.createBien(createBienDto, req.user.userId);
  }

//Affiche la liste des biens de l'utilisateur connecté
 @UseGuards(JwtAuthGuard)
  @Get()
  @ApiResponse({ status: 200, description: 'Liste des biens.' })
  async getAllBiens(@Request() req) {
    return this.biensService.getAllBiens(req.user.userId);
  }


}
