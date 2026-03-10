import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entreprise } from './entreprise.entity';
import { EntrepriseService } from './entreprise.service';
import { EntrepriseController } from './entreprise.controller';

// Module regroupant tous les composants liés à l'entité Entreprise
@Module({
  imports: [TypeOrmModule.forFeature([Entreprise])],
  providers: [EntrepriseService],
  controllers: [EntrepriseController],
  exports: [EntrepriseService],
})
export class EntrepriseModule {}
