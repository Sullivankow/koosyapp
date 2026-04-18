import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProAccessGuard } from '../auth/pro-access.guard';
import { CreateChargeDto, UpdateChargeDto } from './create-charge.dto';
import { ChargesService } from './charges.service';

@ApiTags('Charges')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('charges')
export class ChargesController {
  constructor(private readonly chargesService: ChargesService) {}

  // Le token JWT identifie toujours le propriétaire de la charge.
  @Post()
  @UseGuards(ProAccessGuard)
  @ApiOperation({ summary: 'Créer une charge (utilisateur connecté)' })
  @ApiResponse({ status: 201, description: 'Charge créée.' })
  async create(@Body() dto: CreateChargeDto, @Req() req: any) {
    return this.chargesService.create(dto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les charges de l’utilisateur connecté' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  async list(
    @Req() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.chargesService.list(req.user.userId, Number(page), Number(limit), from, to);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Résumé des charges sur une période' })
  @ApiQuery({ name: 'from', required: true })
  @ApiQuery({ name: 'to', required: true })
  async summary(@Req() req: any, @Query('from') from: string, @Query('to') to: string) {
    if (!from || !to) throw new BadRequestException('Les paramètres from et to sont requis');
    return this.chargesService.summary(req.user.userId, from, to);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une charge' })
  async update(@Param('id') id: string, @Body() dto: UpdateChargeDto, @Req() req: any) {
    const idNum = Number(id);
    if (!id || Number.isNaN(idNum) || !Number.isInteger(idNum)) {
      throw new BadRequestException("L'id de la charge doit être un entier valide");
    }
    return this.chargesService.update(idNum, req.user.userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une charge' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const idNum = Number(id);
    if (!id || Number.isNaN(idNum) || !Number.isInteger(idNum)) {
      throw new BadRequestException("L'id de la charge doit être un entier valide");
    }
    return this.chargesService.remove(idNum, req.user.userId);
  }
}
