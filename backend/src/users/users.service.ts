
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './create-user.dto';
import * as bcrypt from 'bcrypt';
import { NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './create-user.dto'; 

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.usersRepository.save(user);
  }

  // Méthode pour récupérer tous les utilisateurs
  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

//Méthode pour trouver un utilisateur par son id
async findOne(id: number): Promise<User | null> {
  const user = await this.usersRepository.findOne({ where: { id } });
  if (!user) {
    throw new Error('L\'utilisateur n\'éxiste pas');
  }
  return user;
}

//Méthode pour mettre à jour un utilisateur par son id et seulement par champs


async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
  const user = await this.usersRepository.findOne({ where: { id } });
  if (!user) {
    throw new NotFoundException('Utilisateur non trouvé');
  }
  Object.assign(user, updateUserDto);
  if (updateUserDto.password) {
    user.password = await bcrypt.hash(updateUserDto.password, 10);
  }
  return this.usersRepository.save(user);
}




//Méthode pour supprimer un utilisateur par son id
async remove(id: number): Promise<void> {
  const result = await this.usersRepository.delete(id);
  if (result.affected === 0) {
    throw new NotFoundException('Utilisateur non trouvé');
  }



}


//Méthode pour trouver un utilisateur par son email
async findByEmail(email: string): Promise<User | null> {
  return this.usersRepository.findOne({ where: { email } });
}




//Méthode pour sauvegarder le token de push notification d'un utilisateur
async savePushToken(userId: number, token: string | null): Promise<User> {
  const user = await this.usersRepository.findOne({ where: { id: userId }});
  if (!user) throw new NotFoundException('Utilisateur non trouvé');
  user.expoPushToken = token;
  return this.usersRepository.save(user);
}


}
