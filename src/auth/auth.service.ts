import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthUser, JwtPayload } from './types';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async signToken(user: AuthUser) {
    const payload: JwtPayload = {
      sub: user.id,
      name: user.name,
      phone: user.phone,
    };

    return this.jwtService.signAsync(payload);
  }
}
