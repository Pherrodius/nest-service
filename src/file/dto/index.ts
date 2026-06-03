import { IsString, MaxLength, IsOptional, IsNumber } from 'class-validator';
export class UploadFileDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  content?: string;
}
export class LLMAnalysisFileDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  prompt?: string;
  @IsNumber()
  bankId!: number;
  @IsNumber()
  disciplineId!: number;
}
