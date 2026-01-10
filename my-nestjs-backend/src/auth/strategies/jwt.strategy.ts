import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService, TokenPayload } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      // Extract JWT from both Authorization header and cookie
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: Request) => {
          return request?.cookies?.access_token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_EMAIL_SECRET') || 'your-secret-key-change-this',
    });
  }

  async validate(payload: TokenPayload) {
    // Verify token type is access_token
    if (payload.type !== 'access_token') {
      throw new UnauthorizedException('Token không hợp lệ cho hành động này');
    }

    // Get user from database to ensure they still exist and are active
    const user = await this.authService.getUserById(payload.userId);

    if (!user) {
      throw new UnauthorizedException('User không tồn tại');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Tài khoản chưa được kích hoạt');
    }

    // Return user object which will be attached to request.user
    return {
      userId: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
    };
  }
}
