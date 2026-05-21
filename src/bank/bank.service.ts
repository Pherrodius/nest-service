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
      },
      include: {
        disciplines: true,
      },
    });
    return {
      records,
      total: await this.prismaService.bank.count({
        where: {
          name: dto.name,
          description: { contains: dto.description },
          creator: { name: { contains: dto.creator } },
        },
      }),
    };
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
