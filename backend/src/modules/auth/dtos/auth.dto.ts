import { IsString, IsNotEmpty } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class AuthenDTO {
  @ApiProperty({type: "string", example: "test"})
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({type: "string", example: "123456"})
  @IsString()
  @IsNotEmpty()
  password: string;
}
