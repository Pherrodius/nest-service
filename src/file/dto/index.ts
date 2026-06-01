import { IsString, MaxLength, IsOptional } from 'class-validator';
export class UploadFileDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  content?: string;
}
