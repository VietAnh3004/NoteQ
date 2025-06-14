import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RefreshToken } from './refresh.entity';
import { Note } from 'src/modules/note/entities/note.entity';

@Entity('account')
export class Account {
  @PrimaryGeneratedColumn()
  account_id: number;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ nullable: false })
  password: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ default: false })
  is_verified: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.account)
  refreshTokens: RefreshToken[];

  @OneToMany(() => Note, (note) => note.account)
  notes: Note[];
}
