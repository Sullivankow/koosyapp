import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { EntrepriseService } from './entreprise.service';
import { CreateEntrepriseDto, UpdateEntrepriseDto } from './create-entreprise.dto';
import { Entreprise } from './entreprise.entity';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Contrôleur pour gérer les endpoints liés à l'entité Entreprise
@ApiTags('Entreprise')
@ApiBearerAuth() // Documentation Swagger : nécessite un token d'authentification
@UseGuards(JwtAuthGuard) // Tous les endpoints nécessitent que l'utilisateur soit connecté
@Controller('entreprise')
export class EntrepriseController {
  constructor(
    private readonly entrepriseService: EntrepriseService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer une entreprise (authentifié et la relie à l\'utilisateur connecté)' })
  async create(@Body() dto: CreateEntrepriseDto, @Request() req): Promise<Entreprise> {
    // 1. Créer l'entreprise
    const entreprise = await this.entrepriseService.create(dto);
    // 2. Associer l'entreprise à l'utilisateur connecté
    const user = req.user;
    if (user && user.userId) {
      await this.usersService.update(user.userId, { entreprise: entreprise.id });
    }
    return entreprise;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une entreprise par ID (authentifié)' })
  async findOne(@Param('id') id: number): Promise<Entreprise | null> {
    return this.entrepriseService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour une entreprise (authentifié)' })
  async update(@Param('id') id: number, @Body() dto: UpdateEntrepriseDto): Promise<Entreprise | null> {
    return this.entrepriseService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une entreprise (authentifié)' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.entrepriseService.remove(id);
  }
}
