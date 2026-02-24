import { Controller, Post, Body, UseGuards, Req, Get, Patch, Param, BadRequestException, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto, UpdateReservationDto } from './create-reservation.dto';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Query } from '@nestjs/common';


@ApiTags('Réservations')
@ApiBearerAuth()
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  /**
   * GET /events/upcoming
   * Retourne arrivées/départs/nouvelles réservations pour la conciergerie authentifiée.
   */
  @Get('/events/upcoming')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Liste des événements à venir.' })
  @ApiOperation({ summary: 'Retourner les arrivées/départs/nouvelles réservations à venir pour la conciergerie authentifiée' })
  async getEventsUpcoming(
    @Query('days') days: string,
    @Query('limit') limit: string,
    @Query('page') page: string,
    @Req() req: any,
  ) {
    const userId = req.user?.userId;
    const d = days ? Number(days) : 7;
    const l = limit ? Number(limit) : 50;
    const p = page ? Number(page) : 1;
    return this.reservationsService.getEventsUpcoming(Number(userId), d, l, p);
  }


  //Méthode pour créer une réservation 
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: CreateReservationDto })
  @ApiResponse({ status: 201, description: 'Réservation créée avec succès.' })
  @ApiResponse({ status: 404, description: 'Bien ou locataire non trouvé.' })
  @ApiOperation({ summary: 'Créer une réservation' })
  async createReservation(
    @Body() dto: CreateReservationDto,
    @Req() req: any
  ): Promise<any> {
    return this.reservationsService.createReservation(dto, req.user.userId);
  }



  //Méthode pour récupérer la liste des réservations
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Liste des réservations.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  @ApiOperation({ summary: 'Récupérer la liste de toutes les réservations' })
  async getAllReservations() {
    return this.reservationsService.findAll();
  }

  //Méthode pour compter le nombre total de réservations
@Get('count')
@UseGuards(JwtAuthGuard)
@ApiResponse({ status: 200, description: 'Nombre total de réservations.' })
@ApiResponse({ status: 401, description: 'Non authentifié.' })
@ApiOperation({ summary: 'Compter le nombre total de réservations' })
async getReservationsCount() {
  return { total: await this.reservationsService.countReservations() };
}

//Méthode pour récupérer une réservation par son ID
  @Get(':id')
@UseGuards(JwtAuthGuard)
@ApiResponse({ status: 200, description: 'Réservation trouvée.' })
@ApiResponse({ status: 400, description: "Id de réservation invalide." })
@ApiResponse({ status: 401, description: 'Non authentifié.' })
@ApiResponse({ status: 404, description: 'Réservation non trouvée.' })
@ApiOperation({ summary: 'Récupérer une réservation par son id' })
async getReservationById(@Param('id') id: string) {
  const idNum = Number(id);
  if (!id || isNaN(idNum) || !Number.isInteger(idNum)) {
    throw new BadRequestException("L'id de la réservation doit être un entier valide");
  }
  return this.reservationsService.findOneReservation(idNum);
}




// Mise à jour d'une réservation (utilisateur connecté)
    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBody({ type: UpdateReservationDto })
    @ApiResponse({ status: 200, description: 'Réservation mise à jour.' })
    @ApiResponse({ status: 400, description: "Id de réservation invalide." })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 404, description: 'Réservation non trouvée.' })
    @ApiResponse({ status: 500, description: 'Erreur serveur.' })
    @ApiOperation({ summary: 'Mettre à jour une réservation par son id' })
    async updateReservation(
      @Param('id') id: string,
      @Body() updateDto: UpdateReservationDto
    ) {
      const idNum = Number(id);
      if (!id || isNaN(idNum) || !Number.isInteger(idNum)) {
        throw new BadRequestException("L'id de la réservation doit être un entier valide");
      }
      return this.reservationsService.updateReservation(idNum, updateDto);
    }

    //Méthode pour supprimer une réservation
  @Delete(':id')
@UseGuards(JwtAuthGuard)
@ApiResponse({ status: 200, description: 'Réservation supprimée.' })
@ApiResponse({ status: 400, description: "Id de réservation invalide." })
@ApiResponse({ status: 401, description: 'Non authentifié.' })
@ApiResponse({ status: 404, description: 'Réservation non trouvée.' })
@ApiOperation({ summary: 'Supprimer une réservation par son id' })
async deleteReservation(@Param('id') id: string) {
  const idNum = Number(id);
  if (!id || isNaN(idNum) || !Number.isInteger(idNum)) {
    throw new BadRequestException("L'id de la réservation doit être un entier valide");
  }
  return this.reservationsService.deleteReservation(idNum);
}







}
