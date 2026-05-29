import { QuestionType } from 'generated/prisma/enums';

export class SearchQuestionsDto {
  keyword?: string;
  type?: QuestionType;
  time?: string;
}
