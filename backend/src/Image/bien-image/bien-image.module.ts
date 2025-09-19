import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bien } from '../../biens/bien.entity';
import { BienImage } from '../image.entity';
import { BienImageService } from './bien-image.service';
import { BienImageController } from './bien-image.controller';

@Module({
	imports: [TypeOrmModule.forFeature([Bien, BienImage])],
	providers: [BienImageService],
	controllers: [BienImageController],
})
export class BienImageModule {}
