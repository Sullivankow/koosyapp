import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bien } from './bien.entity';
import { User } from '../users/user.entity';
import { CreateBienDto } from './create-bien.dto';

@Injectable()
export class BiensService {
  constructor(
    @InjectRepository(Bien)
    private biensRepository: Repository<Bien>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createBien(createBienDto: CreateBienDto, userId: number): Promise<Bien> {
    const user = await this.usersRepository.findOne({ where: { id: userId }, relations: ['biens'] });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const biensCount = await this.biensRepository.count({ where: { proprio: { id: userId } } });
    if (user.abonnement === 'gratuit' && biensCount >= 5) {
      throw new ForbiddenException('Limite atteinte : abonnement gratuit limité à 5 biens.');
    }

    const bien = this.biensRepository.create({
      ...createBienDto,
      proprio: user,
    });
    return this.biensRepository.save(bien);
  }
}
