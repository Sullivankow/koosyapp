import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LigneDevis } from './ligne-devis.entity';
import { LigneDevisService } from './ligne-devis.service';
import { LigneDevisController } from './ligne-devis.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LigneDevis])],
  providers: [LigneDevisService],
  controllers: [LigneDevisController],
  exports: [LigneDevisService],
})
export class LigneDevisModule {}
