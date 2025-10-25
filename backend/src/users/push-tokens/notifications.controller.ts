import { Controller, Post, UseGuards, Request, Body, Get, Delete, BadRequestException, Param, Query, NotFoundException, HttpCode } from '@nestjs/common';
import { TachesService } from '../../taches/taches.service';
import { ApiBearerAuth, ApiBody, ApiTags, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PushTokensService } from './push-tokens.service';
import { UsersService } from '../users.service';
import { NotificationsService } from './notification.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly tachesService: TachesService,
    private readonly usersService: UsersService,
    private readonly pushTokensService: PushTokensService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('rappel-taches')
  async lancerRappelTaches() {
    return this.tachesService.envoyerRappelsTachesPourDemain();
  }

  // --- Notifications API: unread count, list, mark-read, mark-all-read ---
  @Get('unread-count')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getUnreadCount(@Request() req) {
    const userId = req.user?.userId;
    if (!userId) throw new BadRequestException('User not authenticated');
    try {
      const unread = await this.notificationsService.getUnreadCount(Number(userId));
      return { unread };
    } catch (err) {
      console.error('[notifications.controller] getUnreadCount error', err);
      throw new BadRequestException('Could not fetch unread count');
    }
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'page', required: false, type: 'number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: 'number', example: 20 })
  async listNotifications(@Request() req, @Query('page') page = '1', @Query('limit') limit = '20') {
    const userId = req.user?.userId;
    if (!userId) throw new BadRequestException('User not authenticated');
    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const l = Math.max(1, Math.min(100, parseInt(String(limit), 10) || 20));
    try {
      return this.notificationsService.list(Number(userId), p, l);
    } catch (err) {
      console.error('[notifications.controller] listNotifications error', err);
      throw new BadRequestException('Could not list notifications');
    }
  }

  @Post(':id/mark-read')
  @ApiParam({ name: 'id', required: true, description: 'ID de la notification' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async markRead(@Request() req, @Param('id') idParam: string) {
    const userId = req.user?.userId;
    if (!userId) throw new BadRequestException('User not authenticated');
    const id = Number(idParam);
    if (Number.isNaN(id)) throw new BadRequestException('Invalid notification id');
    try {
      const unread = await this.notificationsService.markRead(Number(userId), id);
      return { success: true, unread };
    } catch (err) {
      console.error('[notifications.controller] markRead error', err);
      throw new NotFoundException('Notification not found or not owned by user');
    }
  }

  @Post('mark-all-read')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async markAllRead(@Request() req) {
    const userId = req.user?.userId;
    if (!userId) throw new BadRequestException('User not authenticated');
    try {
      const unread = await this.notificationsService.markAllRead(Number(userId));
      return { success: true, unread };
    } catch (err) {
      console.error('[notifications.controller] markAllRead error', err);
      throw new BadRequestException('Could not mark notifications as read');
    }
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

  // Admin / test: envoyer une notification à un utilisateur (permet de tester via Swagger)
  @Post('admin/send')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiBody({ schema: {
      type: 'object',
      properties: {
        userId: { type: 'number', example: 1 },
        title: { type: 'string', example: 'Rappel de tâche' },
        body: { type: 'string', example: 'Ta tâche est due demain' },
        data: { type: 'object', nullable: true },
      },
    },
  })
  async adminSend(@Request() req, @Body() body: { userId: number; title: string; body: string; data?: any }) {
    // note: this endpoint is protected by JWT but not role-checked; use for testing
    if (!body || !body.userId || !body.title) throw new BadRequestException('userId and title required');
    try {
      const result = await this.notificationsService.createAndSend(Number(body.userId), body.title, body.body || '', body.data || {});
      return { ok: true, result };
    } catch (err) {
      console.error('[notifications.controller] adminSend error', err);
      throw new BadRequestException('Could not send notification');
    }
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