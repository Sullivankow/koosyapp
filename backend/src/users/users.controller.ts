import { ApiBearerAuth, ApiTags, ApiBody } from '@nestjs/swagger';
import { Controller, Post, Body, Get, Patch, Delete, Param, ForbiddenException, Request, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { TachesService } from '../taches/taches.service';
import { CreateUserDto, UpdateUserDto } from './create-user.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


@ApiTags('Utilisateur (Conciergerie)')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService, private readonly tachesService: TachesService) {}

//Ajouter un nouvel utilisateur
    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    //Afficher la liste de tous les utilisateurs
    @Get()
findAll() {
  return this.userService.findAll();
}

//Sauvegarder le token de push notification d'un utilisateur
@Post('me/push-token')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiBody({ schema: { properties: { token: { type: 'string', example: 'ExponentPushToken[abc123]' } } } })
async savePushToken(@Request() req, @Body() body: { token: string }) {
  const userId = req.user?.userId;
  if (!body || !body.token) {
    throw new BadRequestException('Missing token in request body');
  }
  return this.userService.savePushToken(userId, body.token);
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
    const user = await this.userService.findOne(Number(userId));
    if (!user || !user.expoPushToken) {
      throw new BadRequestException('No expoPushToken registered for user');
    }
    // envoyer une notification simple
    await this.tachesService.sendExpoPushNotification(user.expoPushToken, 'Test Koosy', `Notification test pour ${user.email}`);
    return { success: true };
  }


//Affiche un utilisateur par son id 
@Get(':id')
findOne(@Param('id') id : number) {
return this.userService.findOne(Number (id));
}

//Modifier un utilisateur par son id, seulement les champs que tu envoies
@Patch(':id')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
  return this.userService.update(id, updateUserDto);
}


//Supprimer un utilisateur par son id 
@Delete(':id')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
async remove(@Param('id') id: number, @Request() req) {
  if (req.user.userId !== Number(id)) {
    throw new ForbiddenException('Vous ne pouvez supprimer que votre propre compte.');
  }
  return this.userService.remove(Number(id));
}



}
