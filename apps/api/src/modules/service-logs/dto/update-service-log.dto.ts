import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateServiceLogDto {
  @IsNotEmpty()
  @IsString()
  note: string;
}


