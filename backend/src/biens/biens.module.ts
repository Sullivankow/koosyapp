import { Module } from '@nestjs/common';
import { BiensService } from './biens.service';
import { BiensController } from './biens.controller';
import { Bien } from './bien.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';




@Module({
  providers: [BiensService],
  controllers: [BiensController],
  imports: [TypeOrmModule.forFeature([Bien, User])],
})
export class BiensModule {}
