import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AccountRepository } from './repos/account.repository';
import { RefreshRepository } from './repos/refresh.repository';
import { JwtService } from '@nestjs/jwt';
import { AuthenDTO } from './dtos/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService extends UserService {
  constructor(
    accountRepository: AccountRepository,
    refreshRepository: RefreshRepository,
    jwtService: JwtService,
  ) {
    super(accountRepository, refreshRepository, jwtService);
  }

  override async register({ username, password }: AuthenDTO): Promise<void> {
    try {
      const findUser = await this.accountRepository.findByUsername(username);
      if (findUser) {
        throw new ConflictException('Username already exists');
      }

      const encryptedPassword = await bcrypt.hash(password, 12);
      await this.accountRepository.create(username, encryptedPassword, true);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async deleteAccount(account_id: number) {
    try {
      await this.accountRepository.delete(account_id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to delete account');
    }
  }
}
