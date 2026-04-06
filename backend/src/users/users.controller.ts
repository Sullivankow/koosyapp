import { ApiBearerAuth, ApiTags, ApiBody, ApiOperation, ApiResponse, ApiPropertyOptional } from '@nestjs/swagger';
import { Controller, Post, Body, Get, Patch, Delete, Param, ForbiddenException, Request, BadRequestException, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { TachesService } from '../taches/taches.service';
import { PushTokensService } from './push-tokens/push-tokens.service';
import { CreateUserDto, UpdateUserDto } from './create-user.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SettingsDto } from './settings.dto';
import { IsOptional, IsNumber } from 'class-validator';


class BetaAccessDto {
  @ApiPropertyOptional({
    example: 30,
    description: 'Nombre de jours pendant lesquels l’accès bêta est actif. Par défaut: 30 jours.',
  })
  @IsOptional()
  @IsNumber()
  durationInDays?: number;
}


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
  @ApiOperation({ summary: 'Créer un nouvel utilisateur' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }


    //Afficher la liste de tous les utilisateurs
    @Get()
    @ApiOperation({ summary: 'Afficher la liste de tous les utilisateurs' })
    findAll() {
      return this.userService.findAll();
    }



  // Retourne les informations du user authentifié (incluant settings si présent).
  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Retourne les informations de l’utilisateur authentifié (incluant les préférences si présentes)' })
  async getMe(@Request() req) {
    const userId = req.user?.userId;
    const idNum = Number(userId);
    if (!userId || isNaN(idNum)) throw new ForbiddenException('Utilisateur non authentifié');
    try {
      const user = await this.userService.findOne(idNum);
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...safe } = user as any;
        return safe;
      }
      return null;
    } catch (err) {
      // si l'utilisateur n'existe pas, retourner null plutôt que 500
      return null;
    }
  }





    //Affiche un utilisateur par son id 
    @Get(':id')
    @ApiOperation({ summary: 'Afficher un utilisateur par son id' })
    async findOne(@Param('id') id : number) {
      const user = await this.userService.findOne(Number(id));
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...safe } = user as any;
        return safe;
      }
      return null;
    }


    //Modifier un utilisateur par son id, seulement les champs que tu envoies
    @Patch(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Modifier un utilisateur par son id (partiel)' })
    async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
      return this.userService.update(id, updateUserDto);
    }



    // Supprimer son propre compte utilisateur (auto-suppression)
    @Delete(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Supprimer son propre compte utilisateur' })
    @ApiResponse({ status: 200, description: 'Compte utilisateur supprimé avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Vous ne pouvez supprimer que votre propre compte.' })
    @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })
    async remove(@Param('id') id: number, @Request() req) {
      if (req.user.userId !== Number(id)) {
        throw new ForbiddenException('Vous ne pouvez supprimer que votre propre compte.');
      }
      return this.userService.remove(Number(id));
    }

    // Supprimer n'importe quel utilisateur (admin uniquement)
    @Delete('admin/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Supprimer n’importe quel utilisateur (admin uniquement)' })
    @ApiResponse({ status: 200, description: 'Utilisateur supprimé avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Accès réservé aux administrateurs.' })
    @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })
    async adminRemove(@Param('id') id: number) {
      return this.userService.remove(Number(id));
    }

    // Activer l'accès bêta pour un utilisateur pendant une durée donnée, 30 jours par défaut.
    @Post('admin/:id/beta-access')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Activer l’accès bêta pour un utilisateur' })
    @ApiBody({ type: BetaAccessDto })
    async grantBetaAccess(@Param('id') id: number, @Body() body: BetaAccessDto) {
      return this.userService.grantBetaAccess(Number(id), body.durationInDays ?? 30);
    }

    // Retirer immédiatement l'accès bêta d'un utilisateur.
    @Delete('admin/:id/beta-access')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Retirer l’accès bêta à un utilisateur' })
    async revokeBetaAccess(@Param('id') id: number) {
      return this.userService.revokeBetaAccess(Number(id));
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
