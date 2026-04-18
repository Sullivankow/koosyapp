import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private get refreshTokenSecret() {
    return process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'devRefreshSecret123';
  }

  private async issueTokens(user: { id: number; email: string; role: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.refreshTokenSecret,
      expiresIn: '30d',
    });

    return { accessToken, refreshToken };
  }

  async login(loginDto: { email: string; password: string }) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
    const { accessToken, refreshToken } = await this.issueTokens(user);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.setRefreshTokenHash(user.id, refreshTokenHash);
    // Retourne aussi le prénom et le nom
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      prenom: user.prenom,
      nom: user.nom,
      role: user.role,
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token manquant');
    }

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.refreshTokenSecret,
      });
    } catch {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }

    const userId = Number(payload?.sub);
    if (!userId) {
      throw new UnauthorizedException('Refresh token invalide');
    }

    const user = await this.usersService.findOneWithRefreshTokenHash(userId);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Session expirée');
    }

    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) {
      throw new UnauthorizedException('Refresh token invalide');
    }

    const tokens = await this.issueTokens(user);
    const newRefreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
    await this.usersService.setRefreshTokenHash(user.id, newRefreshTokenHash);

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      prenom: user.prenom,
      nom: user.nom,
      role: user.role,
    };
  }

  async logout(refreshToken: string) {
    if (!refreshToken) {
      return { success: true };
    }

    try {
      const payload: any = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.refreshTokenSecret,
      });
      const userId = Number(payload?.sub);
      if (userId) {
        const user = await this.usersService.findOneWithRefreshTokenHash(userId);
        if (user?.refreshTokenHash) {
          const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
          if (matches) {
            await this.usersService.setRefreshTokenHash(userId, null);
          }
        }
      }
    } catch {
      // On rend quand même une réponse 200 pour un logout idempotent.
    }

    return { success: true };
  }
}
