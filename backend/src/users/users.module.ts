
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserPushToken } from './push-tokens/user-push-token.entity';
import { PushTokensService } from './push-tokens/push-tokens.service';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { NotificationsController } from './push-tokens/notifications.controller';
import { TachesModule } from '../taches/taches.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserPushToken]), TachesModule],
  providers: [UsersService, PushTokensService],
  controllers: [UsersController, NotificationsController],
   exports: [UsersService, PushTokensService],
})
export class UsersModule {}
