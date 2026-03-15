import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LigneFacture } from './ligne-facture.entity';
import { LigneFactureService } from './ligne-facture.service';
import { LigneFactureController } from './ligne-facture.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LigneFacture])],
  providers: [LigneFactureService],
  controllers: [LigneFactureController],
  exports: [LigneFactureService],
})
export class LigneFactureModule {}
