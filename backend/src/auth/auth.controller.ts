import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';




@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Authentifier un utilisateur et retourner un token JWT' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
