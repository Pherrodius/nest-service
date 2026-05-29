import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  ArrayMinSize,
  ValidateNested,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { QuestionType, Answer, CollectionType } from 'generated/prisma/enums';
const parseBooleanQuery = ({
  obj,
  key,
  value,
}: {
  obj: Record<string, unknown>;
  key: string;
  value: unknown;
}) => {
  const rawValue = obj[key] ?? value;

  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return undefined;
  }

  return (
    rawValue === true ||
    rawValue === 'true' ||
    rawValue === 1 ||
    rawValue === '1'
  );
};
class OptionDto {
  @IsEnum(Answer)
  key!: Answer;

  @IsString()
  @IsNotEmpty()
  text!: string;
}

export class createQuestionDto {
  @IsEnum(QuestionType)
  type!: QuestionType;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options!: OptionDto[];

  @IsNotEmpty()
  answer!: Answer | Answer[];

  @IsString()
  @IsNotEmpty()
  bank!: string;

  @IsString()
  @IsNotEmpty()
  discipline!: string;
}

export class getQuestionDto {
  @IsEnum(CollectionType)
  @IsOptional()
  collectionType?: CollectionType;
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
  @IsNumber()
  bankId?: number;
  @IsOptional()
  @IsString()
  discipline?: string;
  @IsOptional()
  @IsNumber()
  disciplineId?: number;
  @IsOptional()
  @IsNumber()
  number?: number;
}
export class checkAnswerDto {
  @IsNumber()
  questionId!: number;
  @IsNotEmpty()
  answer!: Answer | Answer[];
}
export class submitTestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => checkAnswerDto)
  answerSheet!: checkAnswerDto[];
  @IsNumber()
  bankId!: number;
  @IsNumber()
  disciplineId!: number;
  @IsNumber()
  takenTime!: number;
  @IsNumber()
  length!: number;
}
export class createCollectionDto {
  @IsNumber()
  questionId!: number;
  @IsEnum(CollectionType)
  @IsOptional()
  type?: CollectionType;
}
export class getCollectionDto {
  @IsEnum(CollectionType)
  @IsOptional()
  type?: CollectionType;
  @IsOptional()
  @IsNumber()
  bankId?: number;
  @IsOptional()
  @IsNumber()
  disciplineId?: number;
  @IsOptional()
  @IsEnum([0, 1])
  isDay?: number;
  @IsOptional()
  @IsEnum(QuestionType)
  questionType?: QuestionType;
  @IsOptional()
  @Transform(parseBooleanQuery)
  @IsBoolean()
  detailed?: boolean;
}
export class isCollectionExistDto {
  @IsNumber()
  questionId!: number;
}
export class deleteAllCollectionsDto {
  @IsEnum(CollectionType)
  @IsOptional()
  type?: CollectionType;
  @IsOptional()
  @IsNumber()
  bankId?: number;
  @IsOptional()
  @IsNumber()
  disciplineId?: number;
  @IsOptional()
  @IsNumber()
  questionId?: number;
}
export class getResolutionsDto {
  @IsOptional()
  @IsNumber()
  bankId?: number;
  @IsOptional()
  @IsString()
  bankName?: string;
  @IsOptional()
  @IsString()
  disciplineName?: string;
  @IsOptional()
  @IsNumber()
  disciplineId?: number;
  @IsOptional()
  @Transform(parseBooleanQuery)
  @IsBoolean()
  detailed?: boolean;
}
export class deleteResolutionDto {
  @IsOptional()
  @IsNumber()
  bankId?: number;
  @IsOptional()
  @IsNumber()
  disciplineId?: number;
}
