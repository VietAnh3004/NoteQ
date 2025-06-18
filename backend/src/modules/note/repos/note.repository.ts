import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Note } from '../entities/note.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NoteRepository {
  constructor(
    @InjectRepository(Note)
    private readonly repo: Repository<Note>,
  ) {}

  async getNotes(
    account_id: number,
    page: number,
    pageSize: number,
    order: 'ASC' | 'DESC' = 'ASC',
    type: 'created_at' | 'updated_at' | 'importance_rate' = 'created_at',
  ) {
    const [data, total] = await this.repo.findAndCount({
      where: { account: { account_id } },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { [type]: order },
    });

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getNote(note_id: number) {
    return this.repo.findOne({
      where: { note_id },
      relations: ['account'],
    });
  }

  async createNote(
    account_id: number,
    header: string = '',
    content: string = '',
    importance_rate: number = 0,
  ): Promise<Note> {
    const note = this.repo.create({
      header,
      content,
      importance_rate,
      account: { account_id },
    });

    return await this.repo.save(note);
  }

  async updateNote(
    note: Note,
    fieldsToUpdate: Partial<
      Pick<Note, 'header' | 'content' | 'importance_rate'>
    >,
  ): Promise<Note> {
    Object.assign(note, fieldsToUpdate);
    return await this.repo.save(note);
  }

  async deleteNote(note_id: number) {
    await this.repo.delete(note_id);
  }

  async adminDeleteNote(note_id: number, reason: string = '') {
    const note = await this.getNote(note_id);
    note.is_deleted = true;
    note.delete_reason = reason;
    await this.repo.save(note);
  }
}
