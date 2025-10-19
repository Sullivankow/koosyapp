import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPushToken } from './user-push-token.entity';
import { User } from '../user.entity';

@Injectable()
export class PushTokensService {
  constructor(
    @InjectRepository(UserPushToken)
    private repo: Repository<UserPushToken>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}


  //Méthode pour ajouter ou mettre à jour un token push pour un utilisateur
  async upsertToken(userId: number, token: string, platform?: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    let existing = await this.repo.findOne({ where: { token, user: { id: userId } } });
    if (existing) {
      existing.lastSeen = new Date();
      existing.platform = platform ?? existing.platform;
      return this.repo.save(existing);
    }
    const t = this.repo.create({ user, token, platform: platform ?? 'unknown', lastSeen: new Date() });
    return this.repo.save(t);
  }

  //Méthode pour supprimer un token push spécifique ou tous les tokens d'un utilisateur
  async deleteToken(userId: number, token?: string) {
    if (token) {
      await this.repo.delete({ token, user: { id: userId } as any } as any);
      return;
    }
    // delete all tokens for user
    await this.repo.delete({ user: { id: userId } as any } as any);
  }


//Méthode pour récupérer tous les tokens push d'un utilisateur
  async getTokensForUser(userId: number): Promise<UserPushToken[]> {
    return this.repo.find({ where: { user: { id: userId } }, select: ['id', 'token', 'platform', 'lastSeen'] });
  }
}
