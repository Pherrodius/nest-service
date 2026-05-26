import { Injectable } from '@nestjs/common';
import { createBankDto, getBankDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class BankService {
  constructor(private prismaService: PrismaService) {}
  // 创建题库
  async createBank(dto: createBankDto) {
    return this.prismaService.$transaction(async (tx) => {
      await this.createDiscipline(dto.disciplines);
      return tx.bank.create({
        data: {
          name: dto.name,
          description: dto.description,
          creator: { connect: { name: dto.creator } },
          disciplines: {
            connect: dto.disciplines.map((d) => ({ name: d })),
          },
          category: dto.categoryId
            ? { connect: { id: dto.categoryId } }
            : dto.categoryName
              ? {
                  connectOrCreate: {
                    where: { name: dto.categoryName },
                    create: { name: dto.categoryName },
                  },
                }
              : undefined,
        },
      });
    });
  }
  // 获取题库详情
  async getBankDetail(id: number) {
    return this.prismaService.bank.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdTime: true,
        creator: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        disciplines: {
          select: { id: true, name: true },
          orderBy: { id: 'asc' },
        },
        questions: {
          select: {
            id: true,
            content: true,
            disciplineId: true,
            type: true,
          },
        },
      },
    });
  }
  // 获取题库列表
  async getBankList(dto: getBankDto) {
    const records = await this.prismaService.bank.findMany({
      where: {
        name: { contains: dto.name },
        description: { contains: dto.description },
        creator: { name: { contains: dto.creator } },
        categoryId: dto.categoryId,
        category: dto.categoryName
          ? { name: { contains: dto.categoryName } }
          : undefined,
      },
      include: {
        disciplines: true,
        category: true,
        bankCollections: true,
      },
      orderBy: { bankCollections: { _count: 'desc' } },
    });
    return {
      records,
      total: records.length,
    };
  }
  // 创建分类
  async createCategory(name: string | string[]) {
    if (Array.isArray(name)) {
      for (const n of name) {
        await this.prismaService.bankCategory.create({
          data: {
            name: n,
          },
        });
      }
    } else {
      return this.prismaService.bankCategory.create({
        data: {
          name: name,
        },
      });
    }
  }
  // 收藏题库
  async collectBank(bankId: number, userId: number) {
    return this.prismaService.bankCollection.create({
      data: {
        bankId,
        userId,
      },
    });
  }
  //取消收藏
  async cancelCollectBank(bankId: number, userId: number) {
    return this.prismaService.bankCollection.delete({
      where: {
        userId_bankId: {
          bankId,
          userId,
        },
      },
    });
  }
  // 获取用户是否收藏了题库
  async isCollected(bankId: number, userId: number) {
    const collection = await this.prismaService.bankCollection.findUnique({
      where: {
        userId_bankId: {
          bankId,
          userId,
        },
      },
    });
    return !!collection;
  }
  // 获取用户收藏的题库列表
  async getCollectedBanks(userId: number) {
    const collections = await this.prismaService.bankCollection.findMany({
      where: {
        userId,
      },
      include: {
        bank: {
          include: {
            disciplines: true,
          },
        },
      },
    });
    return {
      records: collections.map((c) => c.bank),
      total: collections.length,
    };
  }
  //获取所有分类
  async getAllCategories() {
    return this.prismaService.bankCategory.findMany({
      orderBy: { banks: { _count: 'desc' } },
    });
  }
  // 创建学科
  async createDiscipline(name: string | string[]) {
    if (Array.isArray(name)) {
      for (const n of name) {
        await this.prismaService.discipline.upsert({
          where: {
            name: n,
          },
          create: {
            name: n,
          },
          update: {
            name: n,
          },
        });
      }
    } else {
      return this.prismaService.discipline.upsert({
        where: {
          name: name,
        },
        create: {
          name: name,
        },
        update: {
          name: name,
        },
      });
    }
  }
}
