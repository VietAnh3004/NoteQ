import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { NoteRepository } from './repos/note.repository';
import { Note } from './entities/note.entity';

@Injectable()
export class NoteService {
  constructor(private readonly noteRepository: NoteRepository) {}

  async getAllNotes(
    account_id: number,
    page: number,
    pageSize: number,
    order: 'ASC' | 'DESC' = 'ASC',
    type: 'created_at' | 'updated_at' | 'importance_rate' = 'created_at',
  ) {
    try {
      return this.noteRepository.getNotes(
        account_id,
        page,
        pageSize,
        order,
        type,
      );
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch notes');
    }
  }

  async getNoteById(note_id: number): Promise<Note> {
    try {
      const notes = await this.noteRepository.getNote(note_id);
      if (!notes) {
        throw new NotFoundException(`Note with ID ${note_id} not found`);
      }
      return notes[0];
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch note');
    }
  }

  async createNote(
    account_id: number,
    header: string = '',
    content: string = '',
    importance_rate: number = 0,
  ): Promise<Note> {
    try {
      return this.noteRepository.createNote(
        account_id,
        header,
        content,
        importance_rate,
      );
    } catch (error) {
      throw new InternalServerErrorException('Failed to create note');
    }
  }

  async updateNote(
    account_id: number,
    note_id: number,
    fieldsToUpdate: Partial<
      Pick<Note, 'header' | 'content' | 'importance_rate'>
    >,
  ): Promise<Note> {
    try {
      const note = await this.getNoteById(note_id);
      if (!note) {
        throw new NotFoundException('Note not found');
      }

      if (note.account.account_id != account_id) {
        throw new ConflictException(
          'You do not have permission to edit this note',
        );
      }

      return this.noteRepository.updateNote(note, fieldsToUpdate);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to update note');
    }
  }

  async deleteNote(
    account_id: number,
    note_id: number,
    role: 'user' | 'admin' = 'user',
    reason: string = '',
  ) {
    try {
      const note = await this.noteRepository.getNote(note_id);
      if (!note) {
        throw new NotFoundException('Note not found');
      }

      if (note.account.account_id != account_id) {
        if (role == 'user') {
          throw new UnauthorizedException(
            'You do not have permission to delete this note',
          );
        }
        if (role == 'admin') {
          await this.noteRepository.adminDeleteNote(note_id, reason);
        }
      } else {
        await this.noteRepository.deleteNote(note_id);
      }
    } catch (error) {
      console.log(error);
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to delete note');
    }
  }
}
