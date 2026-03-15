import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Facture } from './facture.entity';
import { FactureService } from './facture.service';
import { FactureController } from './facture.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Facture])],
  providers: [FactureService],
  controllers: [FactureController],
  exports: [FactureService],
})
export class FactureModule {}
