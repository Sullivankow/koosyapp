import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './reservation.entity';
import { Bien } from '../biens/bien.entity';
import { Locataire } from '../locataires/locataire.entity';
import { CreateReservationDto } from './create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepo: Repository<Reservation>,
    @InjectRepository(Bien)
    private bienRepo: Repository<Bien>,
    @InjectRepository(Locataire)
    private locataireRepo: Repository<Locataire>,
  ) {}

  async createReservation(dto: CreateReservationDto, userId: number): Promise<Reservation> {
    // Vérifier le bien appartient à l'utilisateur
    const bien = await this.bienRepo.findOne({ where: { id: dto.bienId, conciergerie: { id: userId } } });
    if (!bien) throw new NotFoundException('Bien non trouvé ou non accessible');

    // Vérifier le locataire
    const locataire = await this.locataireRepo.findOne({ where: { id: dto.locataireId } });
    if (!locataire) throw new NotFoundException('Locataire non trouvé');

    // Conversion des dates
    const [d, m, y] = dto.dateDebut.split('/');
    const dateDebut = new Date(`${y}-${m}-${d}`);
    const [df, mf, yf] = dto.dateFin.split('/');
    const dateFin = new Date(`${yf}-${mf}-${df}`);

    // Création de la réservation
    const reservation = this.reservationRepo.create({
      bien,
      locataire,
      dateDebut,
      dateFin,
      statut: dto.statut || 'en attente',
    });
    return this.reservationRepo.save(reservation);
  }
}