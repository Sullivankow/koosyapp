import { ApiBearerAuth, ApiTags, ApiBody, ApiOperation } from '@nestjs/swagger';
import { Controller, Post, Body, Get, Patch, Delete, Param, ForbiddenException, Request, BadRequestException, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { TachesService } from '../taches/taches.service';
import { PushTokensService } from './push-tokens/push-tokens.service';
import { CreateUserDto, UpdateUserDto } from './create-user.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SettingsDto } from './settings.dto';


@ApiTags('Utilisateur (Conciergerie)')
@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly tachesService: TachesService,
    private readonly pushTokensService: PushTokensService,
  ) {}

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


  /**
   * Endpoint pour mettre à jour partiellement les preferences utilisateur.
   * Reçoit { settings: { ... } } et fusionne côté serveur.
   */
  @Put('me/settings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mettre à jour les préférences utilisateur (merge-safe)' })
  async updateMySettings(@Request() req, @Body() settingsDto: SettingsDto) {
    const userId = req.user?.userId;
    if (!userId) throw new ForbiddenException('Utilisateur non authentifié');
    return this.userService.updateSettings(userId, settingsDto.settings || {});
  }

  



}
