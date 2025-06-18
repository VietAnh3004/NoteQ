import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class PayloadDTO {
  @IsNumber()
  @IsNotEmpty()
  account_id: number;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  email?: string;

  @IsString()
  @IsNotEmpty()
  role: string;
}

export class JwtDTO {
  @IsNumber()
  @IsNotEmpty()
  account_id: number;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  email?: string;

  @IsString()
  @IsNotEmpty()
  role: string;
}

export class RefreshDTO {
  @IsNumber()
  @IsNotEmpty()
  account_id: number;
}
