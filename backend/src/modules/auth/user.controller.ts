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
import {ApiBody, ApiOperation} from "@nestjs/swagger";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false,
  path: '/',
  sameSite: 'lax' as const,
};

@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({description: "Register a new user", summary: "Register a new user"})
  @ApiBody({
    description: "User's credentials for registration",
    type: AuthenDTO,
  })
  @Post('/register')
  async register(@Body() { username, password }: AuthenDTO) {
    await this.userService.register({ username, password });
    return { message: 'Register successful' };
  }

  @ApiOperation({description: "Login a user", summary: "Login a user"})
  @ApiBody({
    description: "User's credentials for login",
    type: AuthenDTO,
  })
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

  @ApiOperation({description: "Logout a user", summary: "Logout a user"})
  @Post('/logout')
  @UseGuards(RefreshJwtAuthGuard)
  async logout(@Request() req: any, @Res({ passthrough: true }) res: any) {
    const refreshToken = req.cookies[env.cookie.refresh.name];
    await this.userService.logout(req.user.account_id, refreshToken);
    res.clearCookie(env.cookie.refresh.name, REFRESH_COOKIE_OPTIONS);
    return { message: 'Logout successful' };
  }

  @ApiOperation({description: "Bind email to user account", summary: "Bind email"}) 
  @ApiBody({
    description: "User's email to bind",
    schema: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'example@gmail.com',
          }
        }
    }
  })
  @Post('/bind-email')
  @UseGuards(JwtAuthGuard)
  async bindEmail(@Request() req: any) {
    await this.userService.bindEmail(req.user.account_id, req.body.email);
    return { message: 'Bind email successful' };
  }

  @ApiOperation({description: "Refresh user token", summary: "Refresh user token"})
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
