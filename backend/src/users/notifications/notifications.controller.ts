import { Controller, Post,UseGuards } from '@nestjs/common';
import { TachesService } from '../../taches/taches.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';


@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly tachesService: TachesService) {}
@UseGuards(JwtAuthGuard)
  @Post('rappel-taches')
  async lancerRappelTaches() {
    return this.tachesService.envoyerRappelsTachesPourDemain();
  }
}