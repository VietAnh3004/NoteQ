import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenDTO } from './dtos/auth.dto';
import { AccountRepository } from './repos/account.repository';
import * as bcrypt from 'bcrypt';
import { Account } from './entities/account.entity';
import { JwtService } from '@nestjs/jwt';
import { env } from 'src/config';
import { RefreshRepository } from './repos/refresh.repository';
import { PayloadDTO } from './dtos/payload.dto';
import { RefreshToken } from './entities/refresh.entity';

@Injectable()
export class UserService {
  constructor(
    protected readonly accountRepository: AccountRepository,
    protected readonly refreshRepository: RefreshRepository,
    protected readonly jwtService: JwtService,
  ) {}

  async register({ username, password }: AuthenDTO): Promise<void> {
    try {
      const findUser = await this.accountRepository.findByUsername(username);
      if (findUser) {
        throw new ConflictException('Username already exists');
      }

      const encryptedPassword = await bcrypt.hash(password, 12);
      await this.accountRepository.create(username, encryptedPassword);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async login({
    username,
    password,
  }: AuthenDTO): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const user: Account =
        await this.accountRepository.findByUsername(username);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (await bcrypt.compare(password, user.password)) {
        const payload = {
          account_id: user.account_id,
          username: user.username,
          email: user.email,
          role: user.role,
        };

        const tokens = await this.generateTokens(payload);
        const refreshTokenExpiry = this.getRefreshTokenExpiryDate();
        await this.storeRefreshToken(
          tokens.refreshToken,
          user.account_id,
          refreshTokenExpiry,
        );

        return tokens;
      }

      throw new ConflictException('Username or password does not matched');
    } catch (error) {
      console.log(error);
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to login');
    }
  }

  async logout(account_id: number, refreshToken: string): Promise<void> {
    try {
      const userActiveRefreshTokens =
        await this.refreshRepository.findToken(account_id);

      for (const storedToken of userActiveRefreshTokens) {
        if (await bcrypt.compare(refreshToken, storedToken.token)) {
          await this.refreshRepository.revoke(storedToken);
          return;
        }
      }

      throw new NotFoundException('No token found to revoke');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to logout');
    }
  }

  async bindEmail(account_id: number, email: string) {
    try {
      const user = await this.accountRepository.findByAccountID(account_id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.email == email) {
        throw new BadRequestException('Email is already bound to this account');
      }

      const findUser = await this.accountRepository.findByEmail(email);
      if (findUser && findUser != user) {
        throw new ConflictException('Email is already in use');
      }

      user.email = email;
      await this.accountRepository.save(user);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to bind email');
    }
  }

  async refreshToken(
    user_id: number,
    currentRefreshToken: string,
  ): Promise<{ accessToken: string; newRefreshToken?: string }> {
    const userRefreshTokens = await this.refreshRepository.findToken(user_id);

    if (!userRefreshTokens.length) {
      throw new UnauthorizedException(
        'No valid refresh tokens found for user.',
      );
    }

    let validStoredToken: RefreshToken | null = null;
    for (const storedToken of userRefreshTokens) {
      if (
        (await bcrypt.compare(currentRefreshToken, storedToken.token)) &&
        storedToken.expires_at > new Date()
      ) {
        validStoredToken = storedToken;
        break;
      }
    }

    if (!validStoredToken) {
      await this.revokeAllUserTokens(user_id);
      throw new UnauthorizedException('Invalid refresh token.');
    }

    validStoredToken.is_revoked = true;
    await this.refreshRepository.saveToken(validStoredToken);

    if (!validStoredToken.account) {
      throw new InternalServerErrorException(
        'User data missing from refresh token entity.',
      );
    }

    const userPayload = {
      account_id: validStoredToken.account.account_id,
      username: validStoredToken.account.username,
      email: validStoredToken.account.email,
      role: validStoredToken.account.role,
    };

    const newTokens = await this.generateTokens(userPayload);

    const newExpiry = this.getRefreshTokenExpiryDate();
    await this.storeRefreshToken(
      newTokens.refreshToken,
      validStoredToken.account.account_id,
      newExpiry,
    );

    return {
      accessToken: newTokens.accessToken,
      newRefreshToken: newTokens.refreshToken,
    };
  }

  async revokeAllUserTokens(user_id: number): Promise<void> {
    await this.refreshRepository.revokeAll(user_id);
  }

  private async generateTokens(payload: PayloadDTO) {
    const accessToken = this.jwtService.sign(
      {
        account_id: payload.account_id,
        username: payload.username,
        email: payload.email,
        role: payload.role,
      },
      {
        secret: env.jwt.secret,
        expiresIn: env.jwt.time,
      },
    );

    const refreshToken = this.jwtService.sign(
      {
        account_id: payload.account_id,
      },
      {
        secret: env.refresh.secret,
        expiresIn: env.refresh.time,
      },
    );
    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(
    token: string,
    user_id: number,
    expiryDate: Date,
  ) {
    const salt = await bcrypt.genSalt();
    const hashedToken = await bcrypt.hash(token, salt);

    await this.refreshRepository.createToken(user_id, hashedToken, expiryDate);
  }

  private getRefreshTokenExpiryDate(): Date {
    const expiresIn = env.refresh.time;
    const now = new Date();
    if (expiresIn.endsWith('d')) {
      now.setDate(now.getDate() + parseInt(expiresIn.slice(0, -1), 10));
    }
    return now;
  }
}
