import { IsString, IsOptional, IsNumber } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class CreateNoteDTO {
  @ApiProperty({type: 'string', description: 'Note title', example: 'Wash the dishes'})
  @IsOptional()
  @IsString()
  header?: string;

  @ApiProperty({type: 'string', description: 'Note content', example: 'Remember to wash the dishes after dinner'})
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({type: 'number', description: 'Importance rate of the note', example: 5})
  @IsOptional()
  @IsNumber()
  importance_rate?: number;
}

