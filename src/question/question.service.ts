import { Injectable } from '@nestjs/common';
import {
  createQuestionDto,
  getQuestionDto,
  checkAnswerDto,
  createCollectionDto,
  getCollectionDto,
} from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { QuestionType, Answer, CollectionType } from 'generated/prisma/enums';

const isValid = (q: createQuestionDto) => {
  // 基础校验
  if (!q.options || q.options.length === 0) return false;

  const optionKeys = q.options.map((o) => o.key);

  // key 唯一性
  const uniqueKeys = new Set(optionKeys);
  if (uniqueKeys.size !== optionKeys.length) return false;

  // 判断题
  if (q.type === QuestionType.TrueFalse) {
    return (
      q.options.length === 2 &&
      optionKeys.every((k) => k === Answer.A || k === Answer.B) &&
      (q.answer === Answer.A || q.answer === Answer.B)
    );
  }

  // 单选题
  if (q.type === QuestionType.SingleChoice) {
    return !Array.isArray(q.answer) && optionKeys.includes(q.answer);
  }

  // 多选题
  if (q.type === QuestionType.MultiChoice) {
    return (
      Array.isArray(q.answer) &&
      q.answer.length > 0 &&
      q.answer.every((a) => optionKeys.includes(a))
    );
  }

  return false;
};
@Injectable()
export class QuestionService {
  constructor(private prismaService: PrismaService) {}
  async createQuestion(dto: createQuestionDto) {
    if (!isValid(dto)) {
      throw new Error(`Invalid question :${dto.content.slice(0, 10)}...`);
    }
    return this.prismaService.$transaction(async (tx) => {
      const question = await tx.question.create({
        data: {
          type: dto.type,
          content: dto.content,
          discipline: dto.discipline,
          subDiscipline: dto.subDiscipline,
        },
      });
      await tx.option.createMany({
        data: dto.options.map((o) => ({
          key: o.key,
          text: o.text,
          questionId: question.id,
        })),
      });
      if (dto.type === QuestionType.SingleChoice) {
        if (Array.isArray(dto.answer))
          throw new Error(
            `question ${dto.content.slice(0, 10)}... should have only one answer`,
          );
        await tx.singleAnswer.create({
          data: {
            answerKey: dto.answer,
            questionId: question.id,
          },
        });
      } else if (dto.type === QuestionType.MultiChoice) {
        if (!Array.isArray(dto.answer))
          throw new Error(
            `question ${dto.content.slice(0, 10)}... should have 2+ answers`,
          );
        await tx.multiChoiceAnswer.createMany({
          data: dto.answer.map((a) => ({
            answerKey: a,
            questionId: question.id,
          })),
        });
      } else if (dto.type === QuestionType.TrueFalse) {
        if (Array.isArray(dto.answer))
          throw new Error(
            `question ${dto.content.slice(0, 10)}... should have only one answer`,
          );
        await tx.trueFalseAnswer.create({
          data: {
            answerKey: dto.answer,
            questionId: question.id,
          },
        });
      }
      return {
        id: question.id,
        ...dto,
      };
    });
  }
  async createManyQuestions(dto: createQuestionDto[]) {
    const validQuestions = dto.filter(isValid);
    const invalidQuestions = dto.filter((q) => !isValid(q));

    const results = await Promise.all(
      validQuestions.map((q) => this.createQuestion(q)),
    );

    return {
      success: results.length,
      failed: invalidQuestions.length,
      questions: results,
    };
  }
  getQuestions(dto: getQuestionDto) {
    return this.prismaService.question.findMany({
      where: {
        type: dto.type,
        content: { contains: dto.content },
        discipline: dto.discipline,
        subDiscipline: dto.subDiscipline,
      },
      include: {
        options: true,
      },
      take: dto.number || 10,
    });
  }
  getQuestion(id: number) {
    return this.prismaService.question.findUnique({
      where: {
        id,
      },
      include: {
        options: true,
      },
    });
  }
  async checkAnswer(dto: checkAnswerDto) {
    return this.prismaService.$transaction(async (tx) => {
      const question = await tx.question.findUnique({
        where: {
          id: dto.questionId,
        },
        include: {
          singleAnswer: true,
          multiChoiceAnswer: true,
          trueFalseAnswer: true,
        },
      });
      if (!question) {
        throw new Error(`Question ${dto.questionId} not found`);
      }
      if (question.type === QuestionType.SingleChoice) {
        if (question.singleAnswer?.answerKey !== dto.answer) {
          const mistake = await tx.collection.create({
            data: {
              userId: dto.userId,
              questionId: question.id,
              type: CollectionType.Mistake,
            },
          });
          return {
            questionId: question.id,
            yourAnswer: dto.answer,
            correctAnswer: question.singleAnswer?.answerKey,
            isCorrect: false,
            mistakeId: mistake.id,
          };
        }
      } else if (question.type === QuestionType.MultiChoice) {
        if (
          question.multiChoiceAnswer?.some(
            (a) => !dto.answer.includes(a.answerKey),
          )
        ) {
          const mistake = await tx.collection.create({
            data: {
              userId: dto.userId,
              questionId: question.id,
              type: CollectionType.Mistake,
            },
          });
          return {
            questionId: question.id,
            yourAnswer: dto.answer,
            correctAnswer: question.multiChoiceAnswer?.map((a) => a.answerKey),
            isCorrect: false,
            mistakeId: mistake.id,
          };
        }
      } else if (question.type === QuestionType.TrueFalse) {
        if (question.trueFalseAnswer?.answerKey !== dto.answer) {
          const mistake = await tx.collection.create({
            data: {
              userId: dto.userId,
              questionId: question.id,
              type: CollectionType.Mistake,
            },
          });
          return {
            questionId: question.id,
            yourAnswer: dto.answer,
            correctAnswer: question.trueFalseAnswer?.answerKey,
            isCorrect: false,
            mistakeId: mistake.id,
          };
        }
      }
      return {
        questionId: question.id,
        yourAnswer: dto.answer,
        correctAnswer: dto.answer,
        isCorrect: true,
      };
    });
  }
  async checkManyAnswers(dto: checkAnswerDto[]) {
    const results = await Promise.all(dto.map((q) => this.checkAnswer(q)));
    const correct = results.filter((r) => r.isCorrect);
    return {
      userId: dto[0].userId,
      correctCount: correct.length,
      wrongCount: results.length - correct.length,
      results,
    };
  }
  async createCollection(dto: createCollectionDto) {
    return this.prismaService.collection.create({
      data: {
        userId: dto.userId,
        questionId: dto.questionId,
        type: dto.type || CollectionType.Note,
      },
    });
  }
  async getCollection(dto: getCollectionDto) {
    const collection = await this.prismaService.collection.findMany({
      where: {
        userId: dto.id,
        type: dto.type,
      },
      include: {
        question: true,
      },
      skip: (dto.currentPage - 1) * dto.pageSize,
      take: dto.pageSize,
    });
    return {
      userId: dto.id,
      type: dto.type,
      collections: collection.map((c) => c.question),
      currentPage: dto.currentPage,
      pageSize: dto.pageSize,
      total: await this.prismaService.collection.count({
        where: {
          userId: dto.id,
          type: dto.type,
        },
      }),
    };
  }
}
