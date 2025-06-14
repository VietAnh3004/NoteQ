import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh.entity';

@Injectable()
export class RefreshRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repo: Repository<RefreshToken>,
  ) {}

  async findToken(account_id: number) {
    return await this.repo.find({
      where: { account: { account_id }, is_revoked: false },
      relations: ['account'],
    });
  }

  async createToken(account_id: number, hashedToken: string, expiryDate: Date) {
    const newRefreshToken = this.repo.create({
      account: { account_id },
      token: hashedToken,
      expires_at: expiryDate,
    });
    await this.repo.save(newRefreshToken);
  }

  async saveToken(token: RefreshToken) {
    await this.repo.save(token);
  }

  async revokeAll(account_id: number) {
    await this.repo.update({ account: { account_id } }, { is_revoked: true });
  }

  async revoke(token: RefreshToken) {
    token.is_revoked = true;
    await this.repo.save(token);
  }
}
