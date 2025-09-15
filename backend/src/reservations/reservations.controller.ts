import { Controller, Post, Body, UseGuards, Req, Get, Patch, Param, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './create-reservation.dto';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateReservationDto } from './update-reservation.dto';

@ApiTags('Réservations')
@ApiBearerAuth()
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}


  //Méthode pour créer une réservation 
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: CreateReservationDto })
  @ApiResponse({ status: 201, description: 'Réservation créée avec succès.' })
  @ApiResponse({ status: 404, description: 'Bien ou locataire non trouvé.' })
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
  async getAllReservations() {
    return this.reservationsService.findAll();
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

  
}
