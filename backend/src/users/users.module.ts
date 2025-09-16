
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { NotificationsController } from './notifications/notifications.controller';
import { TachesModule } from '../taches/taches.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), TachesModule],
  providers: [UsersService],
  controllers: [UsersController, NotificationsController],
   exports: [UsersService],
})
export class UsersModule {}
