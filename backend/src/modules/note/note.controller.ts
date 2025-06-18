import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NoteService } from './note.service';
import { Note } from './entities/note.entity';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateNoteDTO } from './dtos/note.dto';

@Controller('notes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async getAllNotes(
    @Req() req: any,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('order') order: 'ASC' | 'DESC' = 'ASC',
    @Query('type')
    type: 'created_at' | 'updated_at' | 'importance_rate' = 'created_at',
  ) {
    const account_id = req.user.account_id;
    return this.noteService.getAllNotes(
      +account_id,
      +page,
      +pageSize,
      order,
      type,
    );
  }

  @Get(':note_id')
  async getNoteById(@Param('note_id') note_id: number) {
    return this.noteService.getNoteById(+note_id);
  }

  @Post()
  async createNote(
    @Req() req: any,
    @Body() body: CreateNoteDTO,
  ): Promise<Note> {
    const account_id = req.user.account_id;
    const { header = '', content = '', importance_rate = 0 } = body;
    return this.noteService.createNote(
      account_id,
      header,
      content,
      importance_rate,
    );
  }

  @Patch(':note_id')
  async updateNote(
    @Req() req: any,
    @Param('note_id') note_id: number,
    @Body()
    fieldsToUpdate: Partial<
      Pick<Note, 'header' | 'content' | 'importance_rate'>
    >,
  ): Promise<Note> {
    const account_id = req.user.account_id;
    return this.noteService.updateNote(account_id, +note_id, fieldsToUpdate);
  }

  @Delete(':note_id')
  @ApiParam({ name: 'note_id', required: true, type: Number })
  @ApiQuery({ name: 'reason', required: false, type: String })
  async deleteNote(
    @Req() req: any,
    @Param('note_id') note_id: number,
    @Query('reason') reason?: string,
  ) {
    const account_id = req.user.account_id;
    console.log(account_id);
    const role = req.user.role;
    await this.noteService.deleteNote(account_id, +note_id, role, reason);

    return { message: 'Note deleted successfully' };
  }
}
