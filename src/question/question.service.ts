import { Injectable } from '@nestjs/common';
import {
  createQuestionDto,
  getQuestionDto,
  checkAnswerDto,
  createCollectionDto,
  getCollectionDto,
  createBankDto,
  getBankDto,
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

  async createQuestion(dto: createQuestionDto) {
    if (!isValid(dto)) {
      throw new Error(`Invalid question :${dto.content.slice(0, 10)}...`);
    }
    return this.prismaService.$transaction(async (tx) => {
      if (
        !(await tx.bank.findUnique({
          where: {
            name: dto.bank,
          },
        }))
      ) {
        throw new Error(`bank ${dto.bank} not found`);
      }
      await tx.discipline.upsert({
        where: {
          bankName_name: {
            bankName: dto.bank,
            name: dto.discipline,
          },
        },
        update: {},
        create: {
          name: dto.discipline,
          bankName: dto.bank,
        },
      });
      const question = await tx.question.create({
        data: {
          type: dto.type,
          content: dto.content,
          bank: dto.bank,
          discipline: dto.discipline,
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

    const results = await this.prismaService.$transaction(async (tx) => {
      const disciplineSet = new Set<string>();
      validQuestions.forEach((q) => {
        disciplineSet.add(`${q.bank}:${q.discipline}`);
      });

      for (const key of disciplineSet) {
        const [bank, name] = key.split(':');
        await tx.discipline.upsert({
          where: {
            bankName_name: {
              bankName: bank,
              name: name,
            },
          },
          update: {},
          create: {
            name: name,
            bankName: bank,
          },
        });
      }
      class result extends createQuestionDto {
        id: number;
      }
      const results: result[] = [];
      for (const q of validQuestions) {
        const bank = await tx.bank.findUnique({ where: { name: q.bank } });
        if (!bank) continue;

        const question = await tx.question.create({
          data: {
            type: q.type,
            content: q.content,
            bank: q.bank,
            discipline: q.discipline,
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

  getQuestions(dto: getQuestionDto) {
    return this.prismaService.question.findMany({
      where: {
        type: dto.type,
        content: { contains: dto.content },
        bank: dto.bank,
        discipline: dto.discipline,
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
    const records = await this.prismaService.collection.findMany({
      where: {
        userId: dto.id,
        type: dto.type,
      },
      include: {
        question: true,
      },
      skip: ((dto.page || 1) - 1) * (dto.size || 10),
      take: dto.size || 10,
    });
    return {
      userId: dto.id,
      type: dto.type,
      records: records.map((c) => c.question),
      page: dto.page || 1,
      size: dto.size || 10,
      total: await this.prismaService.collection.count({
        where: {
          userId: dto.id,
          type: dto.type,
        },
      }),
    };
  }
  async deleteCollection(id: number) {
    return this.prismaService.collection.delete({
      where: {
        id,
      },
    });
  }

  async createBank(dto: createBankDto) {
    return this.prismaService.bank.create({
      data: {
        name: dto.name,
        description: dto.description,
        creator: dto.creator,
      },
    });
  }

  async getBankList(dto: getBankDto) {
    const records = await this.prismaService.bank.findMany({
      where: {
        name: dto.name,
        description: { contains: dto.description },
        creator: { contains: dto.creator },
      },
      include: {
        disciplines: true,
      },
      skip: ((dto.page || 1) - 1) * (dto.size || 10),
      take: dto.size || 10,
    });
    return {
      records,
      total: await this.prismaService.bank.count({
        where: {
          name: dto.name,
          description: { contains: dto.description },
          creator: { contains: dto.creator },
        },
      }),
      page: dto.page || 1,
      size: dto.size || 10,
    };
  }
}
