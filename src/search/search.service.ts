import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  SearchBanksDto,
  SearchDocumentsDto,
  SearchQuestionsDto,
  SearchUsersDto,
} from './dto';

type CountRange = {
  gte?: number;
  lte?: number;
};

@Injectable()
export class SearchService {
  constructor(private prismaService: PrismaService) {}

  private getStartDate(time?: string) {
    if (!time) {
      return undefined;
    }

    const date = new Date();
    switch (time) {
      case 'week':
      case '1':
        date.setDate(date.getDate() - 7);
        return date;
      case 'month':
      case '2':
        date.setMonth(date.getMonth() - 1);
        return date;
      case 'year':
      case '3':
        date.setFullYear(date.getFullYear() - 1);
        return date;
      default: {
        const parsedDate = new Date(time);
        return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
      }
    }
  }

  private getCountRange(count?: string): CountRange | undefined {
    if (!count) {
      return undefined;
    }

    if (count.endsWith('+')) {
      const gte = Number(count.slice(0, -1));
      return Number.isNaN(gte) ? undefined : { gte };
    }

    const [min, max] = count.split('-').map(Number);
    if (!Number.isNaN(min) && !Number.isNaN(max)) {
      return { gte: min, lte: max };
    }

    return Number.isNaN(min) ? undefined : { gte: min };
  }

  private getSizeRange(size?: string): CountRange | undefined {
    switch (size) {
      case 'small':
        return { lte: 1024 * 1024 };
      case 'medium':
        return { gte: 1024 * 1024, lte: 10 * 1024 * 1024 };
      case 'large':
        return { gte: 10 * 1024 * 1024 };
      default:
        return this.getCountRange(size);
    }
  }

  private getCountHavingSql(range: CountRange) {
    const conditions: Prisma.Sql[] = [];

    if (range.gte !== undefined) {
      conditions.push(Prisma.sql`COUNT(*) >= ${range.gte}`);
    }

    if (range.lte !== undefined) {
      conditions.push(Prisma.sql`COUNT(*) <= ${range.lte}`);
    }

    return conditions.length
      ? Prisma.join(conditions, ' AND ')
      : Prisma.sql`1 = 1`;
  }

  private async getBankIdsByQuestionCount(range: CountRange) {
    const banks = await this.prismaService.$queryRaw<{ bankId: number }[]>(
      Prisma.sql`
        SELECT \`bankId\`
        FROM \`Question\`
        GROUP BY \`bankId\`
        HAVING ${this.getCountHavingSql(range)}
      `,
    );

    return banks.map((bank) => bank.bankId);
  }

  private async getBankIdsByCollectedCount(range: CountRange) {
    const banks = await this.prismaService.$queryRaw<{ bankId: number }[]>(
      Prisma.sql`
        SELECT \`bankId\`
        FROM \`BankCollection\`
        GROUP BY \`bankId\`
        HAVING ${this.getCountHavingSql(range)}
      `,
    );

    return banks.map((bank) => bank.bankId);
  }

  private async getQuestionIdsByCollectedCount(range: CountRange) {
    const questions = await this.prismaService.$queryRaw<
      { questionId: number }[]
    >(
      Prisma.sql`
        SELECT \`questionId\`
        FROM \`Collection\`
        GROUP BY \`questionId\`
        HAVING ${this.getCountHavingSql(range)}
      `,
    );

    return questions.map((question) => question.questionId);
  }

  private async getUserIdsByBankCount(range: CountRange) {
    const users = await this.prismaService.$queryRaw<{ creatorId: number }[]>(
      Prisma.sql`
        SELECT \`creatorId\`
        FROM \`Bank\`
        GROUP BY \`creatorId\`
        HAVING ${this.getCountHavingSql(range)}
      `,
    );

    return users.map((user) => user.creatorId);
  }

  private getQuestionSearchWhere(
    dto: SearchQuestionsDto,
    ids?: number[],
  ): Prisma.QuestionWhereInput {
    const startDate = this.getStartDate(dto.time);

    return {
      ...(dto.type ? { type: dto.type } : {}),
      ...(startDate ? { createdTime: { gte: startDate } } : {}),
      ...(dto.riskLevel ? { riskLevel: dto.riskLevel } : {}),
      ...(ids ? { id: { in: ids } } : {}),
      ...(dto.keyword
        ? {
            OR: [
              {
                content: {
                  contains: dto.keyword,
                },
              },
              {
                options: {
                  some: {
                    text: {
                      contains: dto.keyword,
                    },
                  },
                },
              },
              {
                discipline: {
                  name: {
                    contains: dto.keyword,
                  },
                },
              },
              {
                bank: {
                  name: {
                    contains: dto.keyword,
                  },
                },
              },
              {
                bank: {
                  creator: {
                    name: {
                      contains: dto.keyword,
                    },
                  },
                },
              },
            ],
          }
        : {}),
    };
  }

  private getBankSearchWhere(
    dto: SearchBanksDto,
    ids?: number[],
  ): Prisma.BankWhereInput {
    const startDate = this.getStartDate(dto.time);

    return {
      ...(startDate ? { createdTime: { gte: startDate } } : {}),
      ...(ids ? { id: { in: ids } } : {}),
      ...(dto.keyword
        ? {
            OR: [
              {
                name: {
                  contains: dto.keyword,
                },
              },
              {
                creator: {
                  name: {
                    contains: dto.keyword,
                  },
                },
              },
              {
                category: {
                  name: {
                    contains: dto.keyword,
                  },
                },
              },
              {
                disciplines: {
                  some: {
                    name: {
                      contains: dto.keyword,
                    },
                  },
                },
              },
              {
                description: {
                  contains: dto.keyword,
                },
              },
            ],
          }
        : {}),
    };
  }

  private getDocumentSearchWhere(
    dto: SearchDocumentsDto,
  ): Prisma.DocumentWhereInput {
    const startDate = this.getStartDate(dto.time);
    const sizeRange = this.getSizeRange(dto.size);

    return {
      url: {
        startsWith: '/uploads/docs/',
      },
      ...(dto.mimeType ? { mimeType: dto.mimeType } : {}),
      ...(startDate ? { createdTime: { gte: startDate } } : {}),
      ...(sizeRange ? { size: sizeRange } : {}),
      ...(dto.keyword
        ? {
            OR: [
              {
                originalName: {
                  contains: dto.keyword,
                },
              },
              {
                content: {
                  contains: dto.keyword,
                },
              },
              {
                uploader: {
                  name: {
                    contains: dto.keyword,
                  },
                },
              },
            ],
          }
        : {}),
    };
  }

  private getUserSearchWhere(
    dto: SearchUsersDto,
    ids?: number[],
  ): Prisma.UserWhereInput {
    const startDate = this.getStartDate(dto.time);

    return {
      ...(startDate ? { createdTime: { gte: startDate } } : {}),
      ...(ids ? { id: { in: ids } } : {}),
      ...(dto.keyword
        ? {
            OR: [
              {
                name: {
                  contains: dto.keyword,
                },
              },
              {
                phone: {
                  contains: dto.keyword,
                },
              },
              {
                direction: {
                  contains: dto.keyword,
                },
              },
              {
                area: {
                  contains: dto.keyword,
                },
              },
            ],
          }
        : {}),
    };
  }

  async searchQuestions(dto: SearchQuestionsDto) {
    const collectedCountRange = this.getCountRange(dto.collectedCount);
    const ids = collectedCountRange
      ? await this.getQuestionIdsByCollectedCount(collectedCountRange)
      : undefined;
    const where = this.getQuestionSearchWhere(dto, ids);
    const questions = await this.prismaService.question.findMany({
      where,
      take: 10,
      skip: (dto.page - 1) * 10,
      include: {
        bank: true,
        discipline: true,
        _count: {
          select: {
            collected: true,
          },
        },
      },
    });
    return {
      records: questions,
      total: await this.prismaService.question.count({
        where,
      }),
      page: dto.page,
      pageSize: 10,
    };
  }
  async searchBanks(dto: SearchBanksDto) {
    const questionCountRange = this.getCountRange(dto.questionCount);
    const collectedCountRange = this.getCountRange(dto.collectedCount);
    const questionCountIds = questionCountRange
      ? await this.getBankIdsByQuestionCount(questionCountRange)
      : undefined;
    const collectedCountIds = collectedCountRange
      ? await this.getBankIdsByCollectedCount(collectedCountRange)
      : undefined;
    const ids = questionCountIds
      ? collectedCountIds
        ? questionCountIds.filter((id) => collectedCountIds.includes(id))
        : questionCountIds
      : collectedCountIds;
    const where = this.getBankSearchWhere(dto, ids);
    const banks = await this.prismaService.bank.findMany({
      where,
      take: 10,
      skip: (dto.page - 1) * 10,
      include: {
        creator: true,
        _count: {
          select: {
            questions: true,
            bankCollections: true,
            disciplines: true,
          },
        },
      },
    });
    return {
      records: banks,
      total: await this.prismaService.bank.count({
        where,
      }),
      page: dto.page,
      pageSize: 10,
    };
  }

  async searchDocuments(dto: SearchDocumentsDto) {
    const where = this.getDocumentSearchWhere(dto);
    const documents = await this.prismaService.document.findMany({
      where,
      take: 10,
      skip: (dto.page - 1) * 10,
      include: {
        uploader: true,
      },
      orderBy: {
        createdTime: 'desc',
      },
    });

    return {
      records: documents,
      total: await this.prismaService.document.count({
        where,
      }),
      page: dto.page,
      pageSize: 10,
    };
  }

  async searchUsers(dto: SearchUsersDto) {
    const bankCountRange = this.getCountRange(dto.bankCount);
    const ids = bankCountRange
      ? await this.getUserIdsByBankCount(bankCountRange)
      : undefined;
    const where = this.getUserSearchWhere(dto, ids);
    const users = await this.prismaService.user.findMany({
      where,
      take: 10,
      skip: (dto.page - 1) * 10,
      select: {
        id: true,
        name: true,
        phone: true,
        createdTime: true,
        avatarUrl: true,
        introduction: true,
        direction: true,
        area: true,
        gender: true,
        _count: {
          select: {
            banks: true,
            documents: true,
          },
        },
      },
      orderBy: {
        createdTime: 'desc',
      },
    });

    return {
      records: users,
      total: await this.prismaService.user.count({
        where,
      }),
      page: dto.page,
      pageSize: 10,
    };
  }
}
