import { Injectable, ForbiddenException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bien } from './bien.entity';
import { User } from '../users/user.entity';
import { CreateBienDto, UpdateBienDto } from './create-bien.dto';


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
    const user = await this.usersRepository.findOne({ where: { id: userId }, relations: ['biens'] });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

  const biensCount = await this.biensRepository.count({ where: { conciergerie: { id: userId } } });
    if (user.abonnement === 'gratuit' && biensCount >= 5) {
      throw new ForbiddenException('Limite atteinte : abonnement gratuit limité à 5 biens.');
    }

    const bien = this.biensRepository.create({
      ...createBienDto,
  conciergerie: user,
    });
    return this.biensRepository.save(bien);
  }



//Méthode pour récupérer la liste de tous les biens d'un utilisateur
async getAllBiens(userId: number): Promise<Bien[]> {
  return this.biensRepository.find({
    where: { conciergerie: { id: userId } },
    relations: ['conciergerie'],
  });
}

// Méthode pour récupérer un bien par son id et vérifier qu'il appartient à l'utilisateur
async getBienById(id: number, userId: number): Promise<Bien> {
  const bien = await this.biensRepository.findOne({
    where: { id, conciergerie: { id: userId } },
    relations: ['conciergerie'],
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

// Méthode pour supprimer un bien en vérifiant qu'il appartient à l'utilisateur
async deleteBien(id: number, userId: number): Promise<void> {
  const bien = await this.biensRepository.findOne({ where: { id, conciergerie: { id: userId } } });
  if (!bien) {
    throw new NotFoundException('Bien non trouvé ou non accessible');
  }
  await this.biensRepository.remove(bien);
}
}
