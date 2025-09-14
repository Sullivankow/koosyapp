import { Controller, Post, Body, UseGuards, Request, Get, Delete, Patch } from '@nestjs/common';
import { Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BiensService } from './biens.service';
import { CreateBienDto } from './create-bien.dto';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

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

  // Affiche un bien par son id (accessible à l'utilisateur connecté)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiResponse({ status: 200, description: 'Bien trouvé.' })
  @ApiResponse({ status: 404, description: 'Bien non trouvé.' })
  async getBienById(@Request() req, @Param('id') id: string) {
    return this.biensService.getBienById(Number(id), req.user.userId);
  }


    // Modification d'un bien par son id (utilisateur connecté)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBody({ type: UpdateBienDto })
  @ApiResponse({ status: 200, description: 'Bien mis à jour.' })
  @ApiResponse({ status: 404, description: 'Bien non trouvé.' })
  async updateBien(
    @Request() req,
    @Param('id') id: string,
    @Body() updateBienDto: UpdateBienDto
  ) {
    return this.biensService.updateBien(Number(id), req.user.userId, updateBienDto);
  }


//Suppression d'un bien par son id (utilisateur doit être connecté)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiResponse({ status: 204, description: 'Bien supprimé.' })
  @ApiResponse({ status: 404, description: 'Bien non trouvé.' })
  async deleteBien(@Request() req, @Param('id') id: string) {
    return this.biensService.deleteBien(Number(id), req.user.userId);
  }


}
