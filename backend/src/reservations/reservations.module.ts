import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './reservation.entity';
import { Bien } from '../biens/bien.entity';
import { Locataire } from '../locataires/locataire.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Reservation, Bien, Locataire])],
  controllers: [ReservationsController],
  providers: [ReservationsService]
})
export class ReservationsModule {}
