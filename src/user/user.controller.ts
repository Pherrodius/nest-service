import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { ParseIntPipe } from '@nestjs/common';
@Controller('user')
export class UserController {
  constructor(private user: UserService) {}

  @Get()
  findAll() {
    return this.user.findAll();
  }

  @Get('search')
  search(@Query('id', ParseIntPipe) id: number) {
    return this.user.search(id);
  }

  @Post()
  create(@Body() body: CreateUserDto) {
    return this.user.create(body);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateUserDto) {
    return this.user.update(id, body);
  }
}
