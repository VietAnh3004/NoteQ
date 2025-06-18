import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateNoteDTO {
  @IsOptional()
  @IsString()
  header?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsNumber()
  importance_rate?: number;
}
