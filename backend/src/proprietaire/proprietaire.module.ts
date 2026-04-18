import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proprietaire } from './proprietaire.entity';
import { User } from '../users/user.entity';
import { ProprietaireService } from './proprietaire.service';
import { ProprietaireController } from './proprietaire.controller';

@Module({
	imports: [TypeOrmModule.forFeature([Proprietaire, User])],
	providers: [ProprietaireService],
	controllers: [ProprietaireController],
	exports: [ProprietaireService],
})
export class ProprietaireModule {}
