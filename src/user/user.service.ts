import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  create({ name, phone, password }: CreateUserDto) {
    return this.prisma.user.create({
      data: { name, password, phone },
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  search(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  update(id: number, { name, phone, password }: UpdateUserDto) {
    const filteredData: UpdateUserDto = {};
    if (name !== undefined) filteredData.name = name;
    if (phone !== undefined) filteredData.phone = phone;
    if (password !== undefined) filteredData.password = password;
    if (Object.keys(filteredData).length === 0) {
      return this.prisma.user.findUnique({ where: { id } });
    }
    return this.prisma.user.update({
      where: { id },
      data: filteredData,
    });
  }
}
