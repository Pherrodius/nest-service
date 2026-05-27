import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { LoginByNameDto, LoginByPhoneDto } from './dto';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { ParseIntPipe } from '@nestjs/common';
import { Public } from '@/auth/public.decorator';
import { CurrentUser } from '@/auth/current-user.decorator';
import type { AuthUser } from '@/auth/types';
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Delete('/testhistory/:id')
  deleteTestHistory(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.userService.deleteTestHistory(id, user.id);
  }
  @Get()
  findAll() {
    return this.userService.findAll();
  }
  @Get('testHistory')
  getTestHistory(@CurrentUser() user: AuthUser) {
    return this.userService.getTestHistory(user.id);
  }
  @Get('overview')
  getOverview(@CurrentUser() user: AuthUser) {
    return this.userService.getOverview(user.id);
  }
  @Get('search')
  search(@Query('id', ParseIntPipe) id: number) {
    return this.userService.search(id);
  }

  @Post()
  @Public()
  create(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }
  @Post('login')
  @Public()
  login(@Body() body: LoginByPhoneDto | LoginByNameDto) {
    return this.userService.login(body);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateUserDto) {
    return this.userService.update(id, body);
  }
}
