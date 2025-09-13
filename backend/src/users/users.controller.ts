import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './create-user.dto';

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




}


