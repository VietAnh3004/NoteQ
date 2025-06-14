import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { env } from 'src/config';
import { JwtDTO, PayloadDTO } from 'src/modules/auth/dtos/payload.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: env.jwt.secret,
    });
  }

  async validate(payload: JwtDTO) {
    console.log('[JWT STRATEGY VALIDATE]', payload);
    return {
      account_id: payload.account_id,
      username: payload.username,
      email: payload.email,
      role: payload.role,
    };
  }
}
