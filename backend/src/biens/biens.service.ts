import { Injectable, ForbiddenException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bien } from './bien.entity';
import { User } from '../users/user.entity';
import { CreateBienDto, UpdateBienDto, UpdateBienAdminDto } from './create-bien.dto';
import fetch from 'node-fetch';


@Injectable()
export class BiensService {
  constructor(
    @InjectRepository(Bien)
    private biensRepository: Repository<Bien>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}


  //Méthode pour créer un bien en lié à l'utilisateur(conciergerie)
  async createBien(createBienDto: CreateBienDto, userId: number): Promise<Bien> {
    // Géocodage automatique de l'adresse
    const payload: CreateBienDto = { ...createBienDto };
    if (createBienDto.adresse) {
      const coords = await this.geocodeAdresse(createBienDto.adresse);
      if (coords) {
        payload.lat = coords.lat;
        payload.lng = coords.lng;
      }
    }

    return this.biensRepository.manager.transaction(async (manager) => {
      const usersRepo = manager.getRepository(User);
      const biensRepo = manager.getRepository(Bien);

      const user = await usersRepo
        .createQueryBuilder('user')
        .setLock('pessimistic_write')
        .where('user.id = :userId', { userId })
        .getOne();

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      if (user.abonnement === 'gratuit') {
        const biensCount = await biensRepo.count({ where: { conciergerie: { id: userId } } });
        const effectiveCreationsCount = Math.max(user.freeBienCreationsCount || 0, biensCount);

        if (effectiveCreationsCount >= 5) {
          throw new ForbiddenException('Limite atteinte : abonnement gratuit limité à 5 créations de biens.');
        }

        user.freeBienCreationsCount = effectiveCreationsCount + 1;
        await usersRepo.save(user);
      }

      const { proprietaire, ...rest } = payload;
      const bien = biensRepo.create({
        ...rest,
        conciergerie: user,
        ...(proprietaire ? { proprietaire: { id: proprietaire } } : {}),
      });
      return biensRepo.save(bien);
    });
  }



// Méthode pour récupérer la liste de tous les biens d'un utilisateur
async getAllBiens(userId: number): Promise<Bien[]> {
  const biens = await this.biensRepository.find({
    where: { conciergerie: { id: userId } },
    relations: [
      'conciergerie',
      'taches',
      'images',
      'reservations',
      'reservations.locataire',
      'prestations',
      'proprietaire', // On charge la relation propriétaire
    ],
  });
  return biens;
}

// Méthode admin pour récupérer la liste de tous les biens en base (sans filtre utilisateur)
async getAllBiensAdmin(): Promise<Bien[]> {
  const biens = await this.biensRepository.find({
    relations: [
      'conciergerie',
      'taches',
      'images',
      'reservations',
      'reservations.locataire',
      'prestations',
      'proprietaire',
    ],
  });
  return biens;
}

// Méthode pour récupérer un bien par son id et vérifier qu'il appartient à l'utilisateur
async getBienById(id: number, userId: number): Promise<Bien> {
  const bien = await this.biensRepository.findOne({
    where: { id, conciergerie: { id: userId } },
    relations: ['conciergerie', 'taches'],
  });
  if (!bien) {
    throw new NotFoundException('Bien non trouvé ou non accessible');
  }
  return bien;
}

  //Méthode pour rechercher un bien par mot clé (LIKE)
  async findByMotCle(motCle: string): Promise<Bien[]> {
    try {
      return await this.biensRepository
        .createQueryBuilder('bien')
        .where('bien.nom ILIKE :motCle', { motCle: `%${motCle}%` })
        .getMany();
    } catch (error) {
      console.error('Erreur lors de la recherche par mot clé:', error);
      throw new InternalServerErrorException('Erreur lors de la recherche des biens');
    }
  }

// Méthode pour mettre à jour un bien en vérifiant qu'il appartient à l'utilisateur
async updateBien(id: number, userId: number, updateBienDto: UpdateBienDto): Promise<Bien> {
  const bien = await this.biensRepository.findOne({ where: { id, conciergerie: { id: userId } } });
  if (!bien) {
    throw new NotFoundException('Bien non trouvé ou non accessible');
  }
  Object.assign(bien, updateBienDto);
  return this.biensRepository.save(bien);
}

// Méthode admin pour mettre à jour un bien sans vérifier la conciergerie
async updateBienAdmin(id: number, updateBienDto: UpdateBienAdminDto): Promise<Bien> {
  const bien = await this.biensRepository.findOne({ where: { id } });
  if (!bien) {
    throw new NotFoundException('Bien non trouvé');
  }

  // Si l'adresse change, on regénère les coordonnées
  if (updateBienDto.adresse) {
    const coords = await this.geocodeAdresse(updateBienDto.adresse);
    if (coords) {
      updateBienDto.lat = coords.lat;
      updateBienDto.lng = coords.lng;
    }
  }

  Object.assign(bien, updateBienDto);
  return this.biensRepository.save(bien);
}

// Méthode pour supprimer un bien en vérifiant qu'il appartient à l'utilisateur
async deleteBien(id: number, userId: number): Promise<void> {
  // Récupère le bien avec ses relations
  const bien = await this.biensRepository.findOne({
    where: { id, conciergerie: { id: userId } },
    relations: ['taches', 'reservations'],
  });
  if (!bien) {
    throw new NotFoundException('Bien non trouvé ou non accessible');
  }
  await this.removeBienWithRelations(bien);
}

// Méthode pour supprimer un bien sans vérifier la conciergerie (usage admin)
async deleteBienAdmin(id: number): Promise<void> {
  const bien = await this.biensRepository.findOne({
    where: { id },
    relations: ['taches', 'reservations'],
  });
  if (!bien) {
    throw new NotFoundException('Bien non trouvé');
  }
  await this.removeBienWithRelations(bien);
}

// Suppression physique d'un bien et de ses relations dépendantes
private async removeBienWithRelations(bien: Bien): Promise<void> {
  // Supprime les tâches liées
  if (bien.taches && bien.taches.length > 0) {
    const tacheRepo = this.biensRepository.manager.getRepository('Tache');
    for (const tache of bien.taches) {
      await tacheRepo.delete(tache.id);
    }
  }
  // Supprime les réservations liées
  if (bien.reservations && bien.reservations.length > 0) {
    const reservationRepo = this.biensRepository.manager.getRepository('Reservation');
    for (const reservation of bien.reservations) {
      await reservationRepo.delete(reservation.id);
    }
  }
  // Supprime le bien lui‑même
  await this.biensRepository.remove(bien);
}


//Méthode pour ajouter ou mettre à jour une remarque sur un bien *
async addOrUpdateRemarqueBien(id: number, remarque: string): Promise<Bien> {
  const bien = await this.biensRepository.findOne({ where: { id } });
  if (!bien) throw new NotFoundException('Bien non trouvé');
  bien.remarque = remarque;
  return this.biensRepository.save(bien);
}

//Méthode pour supprimer une remarque dans un bien 
async deleteRemarqueBien(id: number): Promise<{ success: boolean; message: string }> {
  const bien = await this.biensRepository.findOne({ where: { id } });
  if (!bien) throw new NotFoundException('Bien non trouvé');
  if (!bien.remarque) {
    return { success: false, message: 'Aucune remarque à supprimer.' };
  }
  bien.remarque = undefined;
  await this.biensRepository.save(bien);
  return { success: true, message: 'Remarque supprimée avec succès.' };
}

//Méthode pour compter le nombre total de biens
// Compte les biens de l'utilisateur connecté
async countBiens(userId: number): Promise<number> {
  return this.biensRepository.count({ where: { conciergerie: { id: userId } } });
}

// Retourne les informations de quota d'ajout de biens pour l'utilisateur connecté
async getBienQuota(userId: number): Promise<{
  plan: 'gratuit' | 'premium';
  limit: number | null;
  used: number;
  remaining: number | null;
  active: number;
  isLimited: boolean;
}> {
  const user = await this.usersRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new NotFoundException('Utilisateur non trouvé');
  }

  const active = await this.countBiens(userId);

  if (user.abonnement !== 'gratuit') {
    return {
      plan: 'premium',
      limit: null,
      used: active,
      remaining: null,
      active,
      isLimited: false,
    };
  }

  const limit = 5;
  const used = Math.max(user.freeBienCreationsCount || 0, active);
  const remaining = Math.max(0, limit - used);

  return {
    plan: 'gratuit',
    limit,
    used,
    remaining,
    active,
    isLimited: true,
  };
}







  // Méthode pour géocoder une adresse postale avec Geoapify
  async geocodeAdresse(adresse: string): Promise<{ lat: number, lng: number } | null> {
    const apiKey = process.env.GEOPIFY_API_KEY;
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(adresse)}&apiKey=${apiKey}`;
  const fetchFn = global.fetch || ((...args: [any]) => import('node-fetch').then(mod => mod.default(...args)));
    const res = await fetchFn(url);
    const data: any = await res.json();
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].geometry.coordinates;
      return { lat, lng };
    }
    return null;
  }




}
