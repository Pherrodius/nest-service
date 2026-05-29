import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  createQuestionDto,
  getQuestionDto,
  checkAnswerDto,
  createCollectionDto,
  getCollectionDto,
  deleteAllCollectionsDto,
  getResolutionsDto,
  isCollectionExistDto,
  submitTestDto,
  deleteResolutionDto,
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
        try {
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
        } catch (error) {
          console.error(
            `Failed to create question: ${q.content.slice(0, 10)}...`,
            error,
          );
          invalidQuestions.push(q);
        }
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
  async getQuestions(dto: getQuestionDto) {
    const questions = await this.prismaService.question.findMany({
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
    });
    if (!dto.number) return questions;
    return questions.sort(() => Math.random() - 0.5).slice(0, dto.number);
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
  async validateAnswer(dto: checkAnswerDto, userId: number) {
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
        throw new NotFoundException(`Question ${dto.questionId} not found`);
      }
      let isCorrect = true;
      const yourAnswer: string = JSON.stringify(dto.answer);
      let correctAnswer: string = yourAnswer;
      if (question.type === QuestionType.SingleChoice) {
        if (question.singleAnswer?.answerKey !== dto.answer) {
          isCorrect = false;
          correctAnswer = JSON.stringify(question.singleAnswer!.answerKey);
        }
      } else if (question.type === QuestionType.MultiChoice) {
        if (
          question.multiChoiceAnswer?.some(
            (a) => !dto.answer.includes(a.answerKey),
          ) ||
          question.multiChoiceAnswer.length !== dto.answer.length
        ) {
          isCorrect = false;
          correctAnswer = JSON.stringify(
            question.multiChoiceAnswer.map((a) => a.answerKey),
          );
        }
      } else if (question.type === QuestionType.TrueFalse) {
        if (question.trueFalseAnswer?.answerKey !== dto.answer) {
          isCorrect = false;
          correctAnswer = JSON.stringify(question.trueFalseAnswer!.answerKey);
        }
      }
      if (!isCorrect) {
        await tx.collection
          .upsert({
            where: {
              userId_questionId_type: {
                userId,
                questionId: question.id,
                type: CollectionType.Mistake,
              },
            },
            create: {
              userId,
              questionId: question.id,
              type: CollectionType.Mistake,
            },
            update: {
              updatedTime: new Date(),
            },
          })
          .catch(() => {
            throw new BadRequestException('保存错题失败');
          });
      }
      return {
        userId,
        questionId: question.id,
        yourAnswer,
        correctAnswer,
        isCorrect,
      };
    });
  }
  async checkAnswer(dto: checkAnswerDto, userId: number) {
    const ValidationResult = await this.validateAnswer(dto, userId);
    const { questionId, yourAnswer, correctAnswer, isCorrect } =
      ValidationResult;
    return await this.prismaService.resolution
      .upsert({
        where: {
          userId_questionId: {
            userId,
            questionId,
          },
        },
        create: {
          userId,
          questionId,
          yourAnswer,
          correctAnswer,
          isCorrect,
        },
        update: {
          isCorrect,
          yourAnswer,
          updatedTime: new Date(),
        },
      })
      .catch(() => {
        throw new BadRequestException('保存做题记录失败');
      });
  }
  // 提交测试
  async submitTest(dto: submitTestDto, userId: number) {
    const results = await Promise.all(
      dto.answerSheet.map((q) => this.validateAnswer(q, userId)),
    ).catch((error) => {
      throw new BadRequestException(error);
    });
    const correctCount = results.filter((r) => r.isCorrect).length;
    const wrongCount = results.length - correctCount;
    const testRecord = await this.prismaService.testHistory.create({
      data: {
        userId,
        bankId: dto.bankId,
        disciplineId: dto.disciplineId,
        accuracy: correctCount / dto.length,
        takenTime: dto.takenTime,
        length: dto.length,
      },
    });
    return {
      userId,
      correctCount,
      wrongCount,
      results,
      testRecord,
    };
  }
  // 创建收藏
  async createCollection(dto: createCollectionDto, userId: number) {
    return this.prismaService.collection.create({
      data: {
        userId,
        questionId: dto.questionId,
        type: dto.type || CollectionType.Note,
      },
    });
  }
  // 获取收藏
  async getCollection(dto: getCollectionDto, userId: number) {
    const startDay = new Date();
    startDay.setHours(0, 0, 0, 0);
    const endDay = new Date();
    endDay.setHours(23, 59, 59, 999);
    let records = await this.prismaService.collection.findMany({
      where: {
        userId,
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
      userId,
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
  async isCollectionExist(dto: isCollectionExistDto, userId: number) {
    return this.prismaService.$transaction(async (tx) => {
      const isNoted = await tx.collection.findUnique({
        where: {
          userId_questionId_type: {
            userId,
            questionId: dto.questionId,
            type: CollectionType.Note,
          },
        },
      });
      const isMistake = await tx.collection.findUnique({
        where: {
          userId_questionId_type: {
            userId,
            questionId: dto.questionId,
            type: CollectionType.Mistake,
          },
        },
      });
      return {
        userId,
        questionId: dto.questionId,
        notedId: isNoted?.id,
        mistakeId: isMistake?.id,
        isNoted: isNoted !== null,
        isMistake: isMistake !== null,
      };
    });
  }
  // 删除收藏
  async deleteCollection(id: number, userId: number) {
    return this.prismaService.collection.deleteMany({
      where: {
        id,
        userId,
      },
    });
  }
  async deleteAllCollections(dto: deleteAllCollectionsDto, userId: number) {
    return this.prismaService.collection.deleteMany({
      where: {
        userId,
        type: dto.type,
        question: {
          id: dto.questionId,
          bankId: dto.bankId,
          disciplineId: dto.disciplineId,
        },
      },
    });
  }
  async getResolutions(dto: getResolutionsDto, userId: number) {
    if (!dto.detailed) {
      return this.prismaService.resolution.findMany({
        where: {
          userId,
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
        orderBy: { updatedTime: 'desc' },
      });
    }
    return this.prismaService.resolution.findMany({
      where: {
        userId,
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
      include: {
        question: {
          select: {
            content: true,
            bank: {
              select: {
                name: true,
              },
            },
            discipline: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { updatedTime: 'desc' },
    });
  }
  async clearResolutions(dto: deleteResolutionDto, userId: number) {
    return this.prismaService.resolution.deleteMany({
      where: {
        question: {
          bankId: dto.bankId,
          disciplineId: dto.disciplineId,
        },
        userId,
      },
    });
  }
  async deleteResolution(id: number, userId: number) {
    const resolution = await this.prismaService.resolution.findUnique({
      where: {
        id,
      },
    });
    if (!resolution) return new NotFoundException('未找到记录');
    if (resolution.userId !== userId) {
      throw new UnauthorizedException('无权删除其他用户的记录');
    }
    return this.prismaService.resolution.delete({
      where: {
        id,
      },
    });
  }
}
