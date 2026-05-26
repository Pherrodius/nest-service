import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
      select: {
        id: true,
        name: true,
        phone: true,
        createdTime: true,
      },
    });
  }
  getOverview(userId: number) {
    return this.prismaService.$transaction(async (tx) => {
      const testHistorySample = await tx.testHistory.findMany({
        where: { userId },
        take: 3,
        include: {
          bank: true,
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
}
