import { Module } from '@nestjs/common';
import { NoteController } from './note.controller';
import { NoteService } from './note.service';
import { NoteRepository } from './repos/note.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './entities/note.entity';
import { JwtStrategy } from 'src/strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [TypeOrmModule.forFeature([Note]), PassportModule],
  controllers: [NoteController],
  providers: [NoteService, NoteRepository, JwtStrategy],
})
export class NoteModule {}
