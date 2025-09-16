import { Module } from '@nestjs/common';
import { TachesService } from './taches.service';
import { TachesController } from './taches.controller';
import { Bien } from '../biens/bien.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tache } from './tache.entity';

@Module({
  providers: [TachesService],
  controllers: [TachesController],
  imports: [TypeOrmModule.forFeature([Tache, Bien])],
  exports: [TachesService],
})

export class TachesModule {}
