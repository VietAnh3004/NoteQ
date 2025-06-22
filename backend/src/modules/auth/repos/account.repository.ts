import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from '../entities/account.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AccountRepository {
  constructor(
    @InjectRepository(Account)
    private readonly repo: Repository<Account>,
  ) {}

  async findByUsername(username: string): Promise<Account | null> {
    return this.repo.findOne({
      where: { username },
    });
  }

  async findByAccountID(account_id: number): Promise<Account | null> {
    return this.repo.findOne({ where: { account_id } });
  }

  async findByEmail(email: string): Promise<Account | null> {
    return this.repo.findOne({ where: { email } });
  }

  async create(
    username: string,
    encryptedPassword: string,
    is_admin: boolean = false,
  ): Promise<void> {
    const account = this.repo.create({
      username,
      password: encryptedPassword,
      role: is_admin ? 'admin' : 'user',
    });

    return this.save(account);
  }

  async getUser(page: number, pageSize: number, order: 'ASC' | 'DESC' = 'ASC') {
    const [data, total] = await this.repo.findAndCount({
      where: { role: 'user' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { updated_at: order },
      select: {
        account_id: true,
        username: true,
        role: true,
      },
    });

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async save(account: Account): Promise<void> {
    await this.repo.save(account);
  }

  async delete(account_id: number): Promise<void> {
    await this.repo.delete(account_id);
  }
}
