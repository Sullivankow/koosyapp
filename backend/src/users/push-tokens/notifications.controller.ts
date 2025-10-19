import { Controller, Post, UseGuards, Request, Body, Get, Delete, BadRequestException } from '@nestjs/common';
import { TachesService } from '../../taches/taches.service';
import { ApiBearerAuth, ApiBody, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PushTokensService } from './push-tokens.service';
import { UsersService } from '../users.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly tachesService: TachesService,
    private readonly usersService: UsersService,
    private readonly pushTokensService: PushTokensService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('rappel-taches')
  async lancerRappelTaches() {
    return this.tachesService.envoyerRappelsTachesPourDemain();
  }

  // Sauvegarder le token de push notification d'un utilisateur
  @Post('me/push-token')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiBody({ schema: {
      type: 'object',
      properties: {
        token: { type: 'string', nullable: true, example: 'ExponentPushToken[abc123]' },
        platform: { type: 'string', example: 'android' },
      },
    },
  })
  async savePushToken(@Request() req, @Body() body: { token: string | null, platform?: string }) {
    const userId = req.user?.userId;
    console.log('[notifications.controller] savePushToken called, userId=', userId, 'body=', body);
    const hasTokenProp = body && Object.prototype.hasOwnProperty.call(body, 'token');
    if (!hasTokenProp) {
      console.warn('[notifications.controller] Missing token property in request body');
      throw new BadRequestException('Missing token in request body');
    }
    const token = body.token === null || body.token === '' ? null : body.token;
    if (token === null) {
      await this.pushTokensService.deleteToken(Number(userId));
      // keep legacy field empty for compatibility
      const user = await this.usersService.findOne(Number(userId));
      if (user) {
        user.expoPushToken = null;
        await this.usersService.update(Number(userId), { expoPushToken: null } as any).catch(() => {});
      }
      return { cleared: true };
    }
    const saved = await this.pushTokensService.upsertToken(Number(userId), token, body.platform);
    // update legacy field for backward compatibility
    await this.usersService.update(Number(userId), { expoPushToken: token } as any).catch(() => {});
    return saved;
  }

  // Debug route: renvoie user et body pour vérification
  @Post('debug/echo')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  debugEcho(@Request() req, @Body() body: any) {
    return {
      user: req.user || null,
      body: body || null,
      headers: req.headers || null,
    };
  }

  // Endpoint de test: envoie une notification push au token enregistré de l'utilisateur
  @Post('me/test-push')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async testPush(@Request() req) {
    const userId = req.user?.userId;
    if (!userId) throw new BadRequestException('User not authenticated');
    const user = await this.usersService.findOne(Number(userId));
    if (!user || !user.expoPushToken) {
      console.warn('[notifications.controller] No expoPushToken registered for user', userId);
      throw new BadRequestException('No expoPushToken registered for user');
    }
    console.log('[notifications.controller] testPush called for user', userId, 'expoPushToken=', user.expoPushToken);
    const res = await this.tachesService.sendExpoPushNotification(user.expoPushToken, 'Test Koosy', `Notification test pour ${user.email}`);
    console.log('[notifications.controller] testPush expo response:', res);
    return res;
  }

  // Liste les push tokens pour l'utilisateur connecté
  @Get('me/push-tokens')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async listMyPushTokens(@Request() req) {
    const userId = req.user?.userId;
    if (!userId) throw new BadRequestException('User not authenticated');
    return this.pushTokensService.getTokensForUser(Number(userId));
  }

  // Supprime un push token précis pour l'utilisateur connecté (query param ?token=...)
  @Delete('me/push-token')
  @ApiQuery({ name: 'token', required: true, type: 'string', description: "Expo push token à supprimer (ex: ExponentPushToken[...])" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async deleteMyPushToken(@Request() req) {
    const userId = req.user?.userId;
    const token = req.query?.token as string | undefined;
    if (!userId) throw new BadRequestException('User not authenticated');
    if (!token) throw new BadRequestException('token query param required');
    await this.pushTokensService.deleteToken(Number(userId), token);
    return { deleted: token };
  }
}