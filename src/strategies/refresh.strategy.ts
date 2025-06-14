import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { env } from 'src/config';
import { RefreshDTO } from 'src/modules/auth/dtos/payload.dto';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.[env.cookie.refresh.name];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: env.refresh.secret,
      passReqToCallback: false,
    });
  }

  async validate(payload: RefreshDTO) {
    return { account_id: payload.account_id };
  }
}
