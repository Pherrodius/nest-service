import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto, LoginDto, UpdateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    if (createUserDto.password !== createUserDto.confirmPassword) {
      throw new Error('密码不一致');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...rest } = createUserDto;
    return this.prisma.user.create({
      data: rest,
      select: {
        id: true,
        name: true,
        phone: true,
      },
    });
  }
  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        phone: loginDto.phone,
      },
    });
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }
    if (user.password !== loginDto.password) {
      throw new HttpException('密码错误', HttpStatus.UNAUTHORIZED);
    }
    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
    };
  }
  findAll() {
    return this.prisma.user.findMany();
  }

  search(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }
}
