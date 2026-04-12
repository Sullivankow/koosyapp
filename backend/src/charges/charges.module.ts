import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Charge } from './charge.entity';
import { ChargesService } from './charges.service';
import { ChargesController } from './charges.controller';

// Regroupe le contrôleur, le service et l'accès TypeORM des charges.
@Module({
  imports: [TypeOrmModule.forFeature([Charge])],
  providers: [ChargesService],
  controllers: [ChargesController],
})
export class ChargesModule {}
