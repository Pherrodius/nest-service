export enum QuestionType {
  SingleChoice = 'SingleChoice',
  MultiChoice = 'MultiChoice',
  TrueFalse = 'TrueFalse',
}

export enum Answer {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
}

export enum CollectionType {
  Mistake = 'Mistake',
  Note = 'Note',
}

export interface Option {
  key: Answer;
  text: string;
}

export interface CreateQuestionRequest {
  type: QuestionType;
  content: string;
  options: Option[];
  answer: Answer | Answer[];
  bank: string;
  discipline: string;
}

export interface GetQuestionRequest {
  type?: QuestionType;
  content?: string;
  bank?: string;
  discipline?: string;
  number?: number;
}

export interface CheckAnswerRequest {
  userId: number;
  questionId: number;
  answer: Answer | Answer[];
}

export interface CreateCollectionRequest {
  questionId: number;
  userId: number;
  type?: CollectionType;
}

export interface GetCollectionRequest {
  id: number;
  type: CollectionType;
  size?: number;
  page?: number;
}

export interface CreateBankRequest {
  name: string;
  description: string;
  creator: string;
}

export interface GetBankRequest {
  name?: string;
  description?: string;
  creator?: string;
  size?: number;
  page?: number;
}

export interface Question {
  id: number;
  type: QuestionType;
  content: string;
  bank: string;
  discipline: string;
  createdTime: Date;
  options?: Option[];
}

export interface Bank {
  name: string;
  description: string;
  creator: string;
  createdTime: Date;
}

export interface Discipline {
  name: string;
  bankName: string;
}

export interface Collection {
  id: number;
  userId: number;
  questionId: number;
  createdTime: Date;
  type: CollectionType;
}

export interface CreateQuestionResponse {
  id: number;
  type: QuestionType;
  content: string;
  options: Option[];
  bank: string;
  discipline: string;
  answer: Answer | Answer[];
}

export interface CreateManyQuestionsResponse {
  success: number;
  failed: number;
  questions: CreateQuestionResponse[];
}

export interface GetQuestionsResponse extends Question {
  options: Option[];
}

export type GetQuestionResponse = GetQuestionsResponse;

export interface CheckAnswerResponse {
  questionId: number;
  yourAnswer: Answer | Answer[];
  correctAnswer: Answer | Answer[];
  isCorrect: boolean;
  mistakeId?: number;
}

export interface CheckManyAnswersResponse {
  userId: number;
  correctCount: number;
  wrongCount: number;
  results: CheckAnswerResponse[];
}

export type CreateCollectionResponse = Collection;

export interface GetCollectionResponse {
  userId: number;
  type: CollectionType;
  records: Question[];
  page: number;
  size: number;
  total: number;
}

export type DeleteCollectionResponse = Collection;

export type CreateBankResponse = Bank;

export interface GetBankResponse {
  records: (Bank & { disciplines: Discipline[] })[];
  total: number;
  page: number;
  size: number;
}
