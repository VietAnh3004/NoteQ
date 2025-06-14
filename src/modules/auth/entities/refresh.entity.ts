import {
  Entity,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from './account.entity';

@Entity('refresh_token')
export class RefreshToken {
  @PrimaryGeneratedColumn()
  refresh_id: number;

  @Column({ type: 'text' })
  token: string;

  @Column({ default: false })
  is_revoked: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @ManyToOne(() => Account, (account) => account.refreshTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id' })
  account: Account;
}
