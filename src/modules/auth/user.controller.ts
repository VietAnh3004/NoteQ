import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthenDTO } from './dtos/auth.dto';
import { env } from 'src/config';
import { RefreshJwtAuthGuard } from 'src/guards/refresh.guard';
import { JwtAuthGuard } from 'src/guards/jwt.guard';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false,
  path: '/',
  sameSite: 'lax' as const,
};

@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  async register(@Body() { username, password }: AuthenDTO) {
    await this.userService.register({ username, password });
    return { message: 'Register successful' };
  }

  @Post('/login')
  async login(
    @Body() { username, password }: AuthenDTO,
    @Res({ passthrough: true }) res: any,
  ) {
    const tokens = await this.userService.login({ username, password });

    res.cookie(
      env.cookie.refresh.name,
      tokens.refreshToken,
      REFRESH_COOKIE_OPTIONS,
    );
    return { message: 'Login succesful', accessToken: tokens.accessToken };
  }

  @Post('/logout')
  @UseGuards(RefreshJwtAuthGuard)
  async logout(@Request() req: any, @Res({ passthrough: true }) res: any) {
    const refreshToken = req.cookies[env.cookie.refresh.name];
    await this.userService.logout(req.user.account_id, refreshToken);
    res.clearCookie(env.cookie.refresh.name, REFRESH_COOKIE_OPTIONS);
    return { message: 'Logout successful' };
  }

  @Post('/bind-email')
  @UseGuards(JwtAuthGuard)
  async bindEmail(@Request() req: any) {
    await this.userService.bindEmail(req.user.account_id, req.body.email);
    return { message: 'Bind email successful' };
  }

  @Get('/refresh')
  @UseGuards(RefreshJwtAuthGuard)
  async refreshToken(@Req() req: any, @Res({ passthrough: true }) res) {
    const user_id = req.user.user_id;
    const refreshToken = req.cookies[env.cookie.refresh.name];

    if (!refreshToken) {
      this.userService.revokeAllUserTokens(user_id);
      throw new UnauthorizedException('Refresh token cookie not found.');
    }

    try {
      const result = await this.userService.refreshToken(user_id, refreshToken);

      if (result.newRefreshToken) {
        res.cookie(
          env.cookie.refresh.name,
          result.newRefreshToken,
          REFRESH_COOKIE_OPTIONS,
        );
      }

      return { accessToken: result.accessToken };
    } catch (error) {
      res.clearCookie(env.cookie.refresh.name, REFRESH_COOKIE_OPTIONS);
      if (error instanceof UnauthorizedException) {
        throw error;
      } else {
        throw new UnauthorizedException(
          'Could not refresh token due to server error.',
        );
      }
    }
  }
}
