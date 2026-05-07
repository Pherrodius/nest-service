import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  ArrayMinSize,
  ValidateNested,
  IsNumber,
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
  discipline: string;

  @IsOptional()
  @IsString()
  subDiscipline?: string;
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
  discipline?: string;
  @IsOptional()
  @IsString()
  subDiscipline?: string;
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
  @IsNumber()
  pageSize: number;
  @IsNumber()
  currentPage: number;
  @IsOptional()
  total?: number;
}
