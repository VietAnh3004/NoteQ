import { Account } from 'src/modules/auth/entities/account.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('note')
export class Note {
  @PrimaryGeneratedColumn()
  note_id: number;

  @Column()
  header: string;

  @Column()
  content: string;

  @Column()
  importance_rate: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ default: false })
  is_deleted: boolean;

  @Column({ default: null })
  delete_reason: string;

  @ManyToOne(() => Account, (account) => account.notes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;
}
