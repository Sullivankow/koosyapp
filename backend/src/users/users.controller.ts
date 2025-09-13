import { ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Post, Body, Get, Patch, Delete, Param, ForbiddenException, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './create-user.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}

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



}
