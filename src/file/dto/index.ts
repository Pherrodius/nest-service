import { IsString, MinLength, MaxLength } from 'class-validator';
export class UploadFileDto {
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  title!: string;
  @IsString()
  @MaxLength(500)
  content!: string;
  @IsString()
  @MaxLength(10)
  category!: string;
}
