import { Injectable } from '@nestjs/common';
import {
  createQuestionDto,
  getQuestionDto,
  checkAnswerDto,
  createCollectionDto,
  getCollectionDto,
  deleteAllCollectionsDto,
  getResolutionsDto,
  isCollectionExistDto,
} from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { QuestionType, Answer, CollectionType } from 'generated/prisma/enums';

const isValid = (q: createQuestionDto) => {
  if (!q.options || q.options.length === 0) return false;

  const optionKeys = q.options.map((o) => o.key);

  const uniqueKeys = new Set(optionKeys);
  if (uniqueKeys.size !== optionKeys.length) return false;

  if (q.type === QuestionType.TrueFalse) {
    return (
      q.options.length === 2 &&
      optionKeys.every((k) => k === Answer.A || k === Answer.B) &&
      (q.answer === Answer.A || q.answer === Answer.B)
    );
  }

  if (q.type === QuestionType.SingleChoice) {
    return !Array.isArray(q.answer) && optionKeys.includes(q.answer);
  }

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

  // 创建问题
  async createQuestion(dto: createQuestionDto) {
    if (!isValid(dto)) {
      throw new Error(`Invalid question :${dto.content.slice(0, 10)}...`);
    }

    return this.prismaService.$transaction(async (tx) => {
      const question = await tx.question.create({
        data: {
          type: dto.type,
          content: dto.content,
          bank: {
            connect: {
              name: dto.bank,
            },
          },
          discipline: {
            connect: {
              name: dto.discipline,
            },
          },
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
  // 创建多个问题
  async createManyQuestions(dto: createQuestionDto[]) {
    const validQuestions = dto.filter(isValid);
    const invalidQuestions = dto.filter((q) => !isValid(q));

    const results = await this.prismaService.$transaction(async (tx) => {
      const results: (createQuestionDto & { id: number })[] = [];
      for (const q of validQuestions) {
        const question = await tx.question.create({
          data: {
            type: q.type,
            content: q.content,
            bank: {
              connect: {
                name: q.bank,
              },
            },
            discipline: {
              connect: {
                name: q.discipline,
              },
            },
          },
        });

        await tx.option.createMany({
          data: q.options.map((o) => ({
            key: o.key,
            text: o.text,
            questionId: question.id,
          })),
        });

        if (q.type === QuestionType.SingleChoice) {
          await tx.singleAnswer.create({
            data: {
              answerKey: q.answer as Answer,
              questionId: question.id,
            },
          });
        } else if (q.type === QuestionType.MultiChoice) {
          await tx.multiChoiceAnswer.createMany({
            data: (q.answer as Answer[]).map((a) => ({
              answerKey: a,
              questionId: question.id,
            })),
          });
        } else if (q.type === QuestionType.TrueFalse) {
          await tx.trueFalseAnswer.create({
            data: {
              answerKey: q.answer as Answer,
              questionId: question.id,
            },
          });
        }

        results.push({ id: question.id, ...q });
      }

      return results;
    });

    return {
      success: results.length,
      failed: invalidQuestions.length,
      questions: results,
    };
  }
  // 获取问题列表
  getQuestions(dto: getQuestionDto) {
    return this.prismaService.question.findMany({
      where: {
        type: dto.type,
        content: { contains: dto.content },
        bankId: dto.bankId,
        disciplineId: dto.disciplineId,
        bank: { name: dto.bank },
        discipline: { name: dto.discipline },
      },
      include: {
        options: true,
      },
      take: dto.number,
    });
  }
  // 获取问题
  getQuestion(id: number) {
    return this.prismaService.question.findUnique({
      where: {
        id,
      },
      include: {
        options: true,
        bank: true,
        discipline: true,
        singleAnswer: true,
        multiChoiceAnswer: true,
        trueFalseAnswer: true,
      },
    });
  }
  // 检查答案
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
      await tx.resolution.upsert({
        where: {
          userId_questionId: {
            userId: dto.userId,
            questionId: question.id,
          },
        },
        create: {
          userId: dto.userId,
          questionId: question.id,
        },
        update: {
          updatedTime: new Date(),
        },
      });
      if (question.type === QuestionType.SingleChoice) {
        if (question.singleAnswer?.answerKey !== dto.answer) {
          const mistake = await tx.collection.upsert({
            where: {
              userId_questionId_type: {
                userId: dto.userId,
                questionId: question.id,
                type: CollectionType.Mistake,
              },
            },
            create: {
              userId: dto.userId,
              questionId: question.id,
              type: CollectionType.Mistake,
            },
            update: {
              updatedTime: new Date(),
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
          const mistake = await tx.collection.upsert({
            where: {
              userId_questionId_type: {
                userId: dto.userId,
                questionId: question.id,
                type: CollectionType.Mistake,
              },
            },
            create: {
              userId: dto.userId,
              questionId: question.id,
              type: CollectionType.Mistake,
            },
            update: {
              updatedTime: new Date(),
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
          const mistake = await tx.collection.upsert({
            where: {
              userId_questionId_type: {
                userId: dto.userId,
                questionId: question.id,
                type: CollectionType.Mistake,
              },
            },
            create: {
              userId: dto.userId,
              questionId: question.id,
              type: CollectionType.Mistake,
            },
            update: {
              updatedTime: new Date(),
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
  // 检查多个答案
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
  // 创建收藏
  async createCollection(dto: createCollectionDto) {
    return this.prismaService.collection.create({
      data: {
        userId: dto.userId,
        questionId: dto.questionId,
        type: dto.type || CollectionType.Note,
      },
    });
  }
  // 获取收藏
  async getCollection(dto: getCollectionDto) {
    const startDay = new Date();
    startDay.setHours(0, 0, 0, 0);
    const endDay = new Date();
    endDay.setHours(23, 59, 59, 999);
    let records = await this.prismaService.collection.findMany({
      where: {
        userId: dto.userId,
        type: dto.type,
        question: {
          bankId: dto.bankId,
          disciplineId: dto.disciplineId,
          type: dto.questionType,
        },
      },
      include: {
        question: {
          select: {
            id: true,
            type: true,
            content: true,
            bankId: true,
            disciplineId: true,
            bank: true,
            discipline: true,
            createdTime: true,
            options: true,
            singleAnswer: dto.detailed,
            multiChoiceAnswer: dto.detailed,
            trueFalseAnswer: dto.detailed,
          },
        },
      },
    });
    if (dto.isDay === 1) {
      records = records.filter((c) => {
        return c.updatedTime >= startDay && c.updatedTime <= endDay;
      });
    }
    return {
      userId: dto.userId,
      type: dto.type,
      records: records.map((c) => {
        return {
          ...c.question,
          updatedTime: c.updatedTime,
        };
      }),
      total: records.length,
      mistakes: records.filter((c) => c.type === CollectionType.Mistake).length,
      notes: records.filter((c) => c.type === CollectionType.Note).length,
    };
  }
  async isCollectionExist(dto: isCollectionExistDto) {
    return this.prismaService.$transaction(async (tx) => {
      const isNoted = await tx.collection.findUnique({
        where: {
          userId_questionId_type: {
            userId: dto.userId,
            questionId: dto.questionId,
            type: CollectionType.Note,
          },
        },
      });
      const isMistake = await tx.collection.findUnique({
        where: {
          userId_questionId_type: {
            userId: dto.userId,
            questionId: dto.questionId,
            type: CollectionType.Mistake,
          },
        },
      });
      return {
        userId: dto.userId,
        questionId: dto.questionId,
        isNoted: isNoted !== null,
        isMistake: isMistake !== null,
      };
    });
  }
  // 删除收藏
  async deleteCollection(id: number) {
    return this.prismaService.collection.delete({
      where: {
        id,
      },
    });
  }
  async deleteAllCollections(dto: deleteAllCollectionsDto) {
    return this.prismaService.collection.deleteMany({
      where: {
        userId: dto.userId,
        type: dto.type,
        question: {
          bankId: dto.bankId,
          disciplineId: dto.disciplineId,
        },
      },
    });
  }
  async getResolutions(dto: getResolutionsDto) {
    return this.prismaService.resolution.findMany({
      where: {
        userId: dto.userId,
        question: {
          bankId: dto.bankId,
          bank: {
            name: dto.bankName,
          },
          discipline: {
            name: {
              contains: dto.disciplineName,
            },
          },
          disciplineId: dto.disciplineId,
        },
      },
    });
  }
}
