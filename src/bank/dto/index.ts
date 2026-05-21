import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  ArrayMinSize,
  ValidateNested,
  IsNumber,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType, Answer, CollectionType } from 'generated/prisma/enums';

class OptionDto {
  @IsEnum(Answer)
  key: Answer;

  @IsString()
  @IsNotEmpty()
  text: string;
}

export class createQuestionDto {
  @IsEnum(QuestionType)
  type: QuestionType;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options: OptionDto[];

  @IsNotEmpty()
  answer: Answer | Answer[];

  @IsString()
  @IsNotEmpty()
  bank: string;

  @IsString()
  @IsNotEmpty()
  discipline: string;
}

export class getQuestionDto {
  @IsEnum(QuestionType)
  @IsOptional()
  type?: QuestionType;
  @IsString()
  @IsOptional()
  content?: string;
  @IsString()
  @IsOptional()
  bank?: string;
  @IsOptional()
  @IsString()
  discipline: string;
  @IsOptional()
  @IsNumber()
  number?: number;
}
export class checkAnswerDto {
  @IsNumber()
  userId: number;
  @IsNumber()
  questionId: number;
  @IsNotEmpty()
  answer: Answer | Answer[];
}
export class createCollectionDto {
  @IsNumber()
  questionId: number;
  @IsNumber()
  userId: number;
  @IsEnum(CollectionType)
  @IsOptional()
  type?: CollectionType;
}
export class getCollectionDto {
  @IsNumber()
  id: number;
  @IsEnum(CollectionType)
  type: CollectionType;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  size?: number;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;
  @IsOptional()
  total?: number;
}
export class createBankDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsNotEmpty()
  description: string;
  @IsString()
  @IsNotEmpty()
  creator: string;
  @IsArray()
  @ArrayMinSize(1)
  disciplines: string[];
}
export class getBankDto {
  @IsString()
  @IsOptional()
  name?: string;
  @IsString()
  @IsOptional()
  description?: string;
  @IsString()
  @IsOptional()
  creator?: string;
}
