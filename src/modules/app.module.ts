import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteModule } from './note/note.module';
import { AuthModule } from './auth/auth.module';
import dataSource from 'src/libs/typeorm.config';

@Module({
  imports: [TypeOrmModule.forRoot(dataSource.options), NoteModule, AuthModule],
})
export class AppModule {}
