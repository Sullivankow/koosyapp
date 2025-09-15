import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './create-reservation.dto';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Réservations')
@ApiBearerAuth()
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

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
}
