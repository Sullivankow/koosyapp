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
      heureArrivee: dto.heureArrivee,
      dateFin,
      heureDepart: dto.heureDepart,
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


//Méthode pour compter le nombre total de réservations
async countReservations(): Promise<number> {
  return this.reservationRepo.count();
}

  /**
   * Récupère les événements (arrivées/départs/nouvelles réservations) pour la
   * conciergerie fournie, sur la fenêtre fournie (days).
   * Retourne un objet { items, total, page, limit } où items sont des EventItem.
   */
  async getEventsUpcoming(userId: number, days = 7, limit = 50, page = 1, types?: string[], includePast = false) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime());
    end.setDate(end.getDate() + Number(days));
    end.setHours(23, 59, 59, 999);

    // Récupère les réservations liées aux biens de la conciergerie
    const reservations = await this.reservationRepo.createQueryBuilder('r')
      .leftJoinAndSelect('r.bien', 'bien')
      .leftJoinAndSelect('bien.conciergerie', 'conciergerie')
      .leftJoinAndSelect('r.locataire', 'locataire')
      // utiliser l'alias 'conciergerie' créé par le leftJoin plutôt que la notation 'bien.conciergerie.id'
      .where('conciergerie.id = :userId', { userId })
      // passer des bornes ISO complètes (datetime) pour inclure correctement les createdAt timestamp
      .andWhere('(r.dateDebut BETWEEN :start AND :end OR r.dateFin BETWEEN :start AND :end OR r.createdAt BETWEEN :start AND :end)', { start: start.toISOString(), end: end.toISOString() })
      .orderBy('r.dateDebut', 'ASC')
      .getMany();

    // Transformer en items (un reservation peut produire arrival et/ou departure et/ou new_reservation)
    const items: any[] = [];
    for (const r of reservations) {
      const reservationId = (r as any).id;
      // dateDebut/dateFin sont des Date objets
      const dDebut = r.dateDebut ? new Date(r.dateDebut) : null;
      const dFin = r.dateFin ? new Date(r.dateFin) : null;
      const cAt = (r as any).createdAt ? new Date((r as any).createdAt) : null;

      if (dDebut && dDebut >= start && dDebut <= end) {
        if (!types || types.includes('arrival')) {
          //
          items.push({
            id: reservationId,
            type: 'arrival',
            date: dDebut.toISOString().slice(0,10) + (r.heureArrivee ? ' ' + r.heureArrivee : ''),
            heure: r.heureArrivee || '',
            reservationId,
            bien: { id: r.bien.id, nom: (r.bien as any).nom },
            locataire: { id: r.locataire.id, nom: r.locataire.nom, prenom: r.locataire.prenom }
          });
        }
      }
      if (dFin && dFin >= start && dFin <= end) {
        if (!types || types.includes('departure')) {
          //
          items.push({
            id: reservationId,
            type: 'departure',
            date: dFin.toISOString().slice(0,10) + (r.heureDepart ? ' ' + r.heureDepart : ''),
            heure: r.heureDepart || '',
            reservationId,
            bien: { id: r.bien.id, nom: (r.bien as any).nom },
            locataire: { id: r.locataire.id, nom: r.locataire.nom, prenom: r.locataire.prenom }
          });
        }
      }
      if (cAt && cAt >= start && cAt <= end) {
        if (!types || types.includes('new_reservation')) {
          items.push({
            id: reservationId,
            type: 'new_reservation',
            date: cAt.toISOString().slice(0,10),
            heure: null,
            reservationId,
            bien: { id: r.bien.id, nom: (r.bien as any).nom },
            locataire: { id: r.locataire.id, nom: r.locataire.nom, prenom: r.locataire.prenom }
          });
        }
      }
    }

    // Trier par date asc puis type
    items.sort((a,b) => {
      if (a.date < b.date) return -1;
      if (a.date > b.date) return 1;
      if (a.type < b.type) return -1;
      if (a.type > b.type) return 1;
      return 0;
    });

    const total = items.length;
    const startIdx = (page - 1) * limit;
    const paged = items.slice(startIdx, startIdx + limit);

    return { items: paged, total, page, limit };
  }


}