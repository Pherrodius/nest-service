import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { QuestionType } from 'generated/prisma/enums';

export class SearchQuestionsDto {
  @IsOptional()
  @IsString()
  keyword?: string;
  @IsOptional()
  @IsEnum(QuestionType)
  type?: QuestionType;
  @IsOptional()
  @IsString()
  time?: string;
  @IsOptional()
  @IsString()
  collectedCount?: string;
  @IsOptional()
  @IsNumber()
  riskLevel?: number;
  @IsNumber()
  page!: number;
}
export class SearchBanksDto {
  @IsOptional()
  @IsString()
  keyword?: string;
  @IsOptional()
  @IsString()
  questionCount?: string;
  @IsOptional()
  @IsString()
  collectedCount?: string;
  @IsOptional()
  @IsString()
  time?: string;
  @IsNumber()
  page!: number;
}
export class SearchDocumentsDto {
  @IsOptional()
  @IsString()
  keyword?: string;
  @IsOptional()
  @IsString()
  mimeType?: string;
  @IsOptional()
  @IsString()
  size?: string;
  @IsOptional()
  @IsString()
  time?: string;
  @IsNumber()
  page!: number;
}
export class SearchUsersDto {
  @IsOptional()
  @IsString()
  keyword?: string;
  @IsOptional()
  @IsString()
  bankCount?: string;
  @IsOptional()
  @IsString()
  time?: string;
  @IsNumber()
  page!: number;
}
