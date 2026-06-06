import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateUserDto,
  LoginByNameDto,
  LoginByPhoneDto,
  UpdateUserDto,
} from './dto';
import { CollectionType } from 'generated/prisma/enums';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private authService: AuthService,
  ) {}

  private readonly userProfileSelect = {
    id: true,
    name: true,
    phone: true,
    createdTime: true,
    avatarUrl: true,
    introduction: true,
    direction: true,
    area: true,
    gender: true,
  };

  create(createUserDto: CreateUserDto) {
    if (createUserDto.password !== createUserDto.confirmPassword) {
      throw new HttpException('两次输入的密码不一致', HttpStatus.BAD_REQUEST);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...rest } = createUserDto;
    return this.prismaService.user.create({
      data: rest,
      select: {
        id: true,
        name: true,
        phone: true,
      },
    });
  }

  async login(loginDto: LoginByPhoneDto | LoginByNameDto) {
    let user: {
      id: number;
      name: string;
      phone: string;
      password: string;
      avatarUrl?: string | null;
    } | null;
    if ('phone' in loginDto) {
      user = await this.prismaService.user.findUnique({
        where: {
          phone: loginDto.phone,
        },
      });
    } else {
      user = await this.prismaService.user.findUnique({
        where: {
          name: loginDto.name,
        },
      });
    }

    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }

    if (user.password !== loginDto.password) {
      throw new HttpException('密码错误', HttpStatus.UNAUTHORIZED);
    }

    const authUser = {
      id: user.id,
      name: user.name,
      phone: user.phone,
    };

    return {
      ...authUser,
      avatarUrl: user.avatarUrl,
      accessToken: await this.authService.signToken(authUser),
      tokenType: 'Bearer',
    };
  }

  findAll() {
    return this.prismaService.user.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        createdTime: true,
      },
    });
  }

  search(id: number) {
    return this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        phone: true,
        createdTime: true,
      },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.prismaService.user.update({
      where: { id },
      data: updateUserDto,
      select: this.userProfileSelect,
    });
  }

  getProfile(userId: number) {
    return this.prismaService.user.findUnique({
      where: { id: userId },
      select: this.userProfileSelect,
    });
  }

  updateProfile(userId: number, updateUserDto: UpdateUserDto) {
    return this.prismaService.user.update({
      where: { id: userId },
      data: updateUserDto,
      select: this.userProfileSelect,
    });
  }

  updateAvatar(userId: number, avatarUrl: string) {
    return this.prismaService.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: this.userProfileSelect,
    });
  }
  // 获取测试记录
  async getTestHistory(userId: number) {
    return await this.prismaService.testHistory.findMany({
      where: {
        userId,
      },
      include: {
        bank: true,
        discipline: true,
      },
      orderBy: { createdTime: 'desc' },
    });
  }
  async getOverview(userId: number) {
    return this.prismaService.$transaction(async (tx) => {
      const testHistorySample = await tx.testHistory.findMany({
        where: { userId },
        take: 3,
        include: {
          bank: true,
          discipline: true,
        },
        orderBy: { createdTime: 'desc' },
      });
      const recentRecords = testHistorySample.map((t) => {
        return {
          ...t,
          bankName: t.bank.name,
        };
      });
      const practiceCount = await tx.testHistory.count({
        where: { userId },
      });
      const noteCount = await tx.collection.count({
        where: {
          userId,
          type: CollectionType.Note,
        },
      });
      const mistakeCount = await tx.collection.count({
        where: {
          userId,
          type: CollectionType.Mistake,
        },
      });
      const collectedBank = await tx.bankCollection.findMany({
        where: { userId },
        include: {
          bank: true,
        },
      });
      return {
        recentRecords,
        practiceCount,
        noteCount,
        mistakeCount,
        collectedBank,
      };
    });
  }
  async deleteTestHistory(id: number, userId: number) {
    return this.prismaService.$transaction(async (tx) => {
      const testhistory = await tx.testHistory.findUnique({
        where: {
          id,
        },
      });
      if (!testhistory) throw new NotFoundException('测试记录不存在');
      if (testhistory.userId !== userId) {
        throw new UnauthorizedException('无权删除其他用户的测试记录');
      }
      return tx.testHistory.delete({
        where: {
          id,
        },
      });
    });
  }
  getGroupedCollection(type: CollectionType, userId: number) {
    return this.prismaService.bank.findMany({
      where: {
        questions: {
          some: {
            collected: {
              some: {
                userId,
                type,
              },
            },
          },
        },
      },
      include: {
        creator: true,
        questions: {
          where: {
            collected: {
              some: {
                userId,
                type,
              },
            },
          },
        },
      },
    });
  }
  async getMyBank(userId: number) {
    return this.prismaService.$transaction(async (tx) => {
      const practicedbanks = await tx.bank.findMany({
        where: {
          questions: {
            some: {
              resolutions: {
                some: {
                  userId,
                },
              },
            },
          },
        },
        include: {
          _count: {
            select: {
              questions: true,
            },
          },
          questions: {
            where: {
              resolutions: {
                some: {
                  userId,
                },
              },
            },
          },
        },
      });
      const collectedBanks = await tx.bank.findMany({
        where: {
          bankCollections: {
            some: {
              userId,
            },
          },
        },
        include: {
          _count: {
            select: {
              questions: true,
            },
          },
          questions: {
            where: {
              resolutions: {
                some: {
                  userId,
                },
              },
            },
          },
        },
      });
      const createdBanks = await tx.bank.findMany({
        where: {
          creatorId: userId,
        },
        include: {
          _count: {
            select: {
              questions: true,
            },
          },
          questions: {
            where: {
              resolutions: {
                some: {
                  userId,
                },
              },
            },
          },
        },
      });
      const bankMap = new Map<
        number,
        Omit<(typeof practicedbanks)[number], 'questions' | '_count'> & {
          count: number;
          progress: number;
          collected: boolean;
          created: boolean;
        }
      >();
      const mergeBank = (
        { questions, _count, ...bank }: (typeof practicedbanks)[number],
        flags: {
          collected?: boolean;
          created?: boolean;
        },
      ) => {
        const existed = bankMap.get(bank.id);

        if (existed) {
          existed.collected ||= !!flags.collected;
          existed.created ||= !!flags.created;
          return;
        }

        bankMap.set(bank.id, {
          ...bank,
          count: _count.questions,
          progress: questions.length,
          collected: !!flags.collected,
          created: !!flags.created,
        });
      };

      practicedbanks.forEach((bank) => mergeBank(bank, {}));
      collectedBanks.forEach((bank) => mergeBank(bank, { collected: true }));
      createdBanks.forEach((bank) => mergeBank(bank, { created: true }));

      return [...bankMap.values()];
    });
  }
  async getMyFiles(userId: number) {
    return this.prismaService.document.findMany({
      where: {
        uploaderId: userId,
      },
    });
  }
}
