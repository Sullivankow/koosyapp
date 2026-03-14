import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entreprise } from './entreprise.entity';
import { EntrepriseService } from './entreprise.service';
import { EntrepriseController } from './entreprise.controller';
import { UsersModule } from '../users/users.module';

// Module regroupant tous les composants liés à l'entité Entreprise
@Module({
  imports: [TypeOrmModule.forFeature([Entreprise]), UsersModule],
  providers: [EntrepriseService],
  controllers: [EntrepriseController],
  exports: [EntrepriseService],
})
export class EntrepriseModule {}
