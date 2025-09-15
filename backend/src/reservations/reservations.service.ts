import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './reservation.entity';
import { Bien } from '../biens/bien.entity';
import { Locataire } from '../locataires/locataire.entity';
import { CreateReservationDto, UpdateReservationDto } from './create-reservation.dto';





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

    // Création systématique du locataire avec les infos du DTO
    let locataire = await this.locataireRepo.findOne({ where: { email: dto.locataireEmail } });
    if (!locataire) {
      locataire = this.locataireRepo.create({
        nom: dto.locataireNom,
        prenom: dto.locatairePrenom,
        email: dto.locataireEmail,
        telephone: dto.locataireTelephone,
      });
      locataire = await this.locataireRepo.save(locataire);
    }

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




  //Méthode pour récupérer la liste des réservations
  async findAll(): Promise<Reservation[]> {
    return this.reservationRepo.find({ relations:  ['bien', 'locataire']});
  }



//Méthode pour récupérer une réservation par son ID
async findOneReservation(id: number): Promise<Reservation> {
  const reservation = await this.reservationRepo.findOne({ where: { id }, relations: ['bien', 'locataire'] });
  if (!reservation) {
    throw new NotFoundException('Réservation non trouvée');
  }
  return reservation;
}


  //Méthode pour mettre à jour une réservation
  async updateReservation(id: number, updateDto: UpdateReservationDto) {
  const reservation = await this.reservationRepo.findOne({ where: { id } });
  if (!reservation) {
    throw new NotFoundException('Réservation non trouvée');
  }
  Object.assign(reservation, updateDto);
  return this.reservationRepo.save(reservation);
}

//Méthode pour supprimer une réservation
async deleteReservation(id: number) {
  const reservation = await this.reservationRepo.findOne({ where: { id } });
  if (!reservation) {
    throw new NotFoundException('Réservation non trouvée');
  }
  await this.reservationRepo.remove(reservation);
  return { message: 'Réservation supprimée avec succès' };
}


}