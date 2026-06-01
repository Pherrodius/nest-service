import {
  Controller,
  ParseIntPipe,
  Query,
  Get,
  Post,
  Body,
  Param,
  Delete,
} from '@nestjs/common';
import { BankService } from './bank.service';
import { createBankDto, getBankDto } from './dto';
import { Public } from '@/auth/public.decorator';
import { CurrentUser } from '@/auth/current-user.decorator';
import type { AuthUser } from '@/auth/types';

@Controller('bank')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  // 创建题库
  @Post('create')
  createBank(@Body() body: createBankDto) {
    return this.bankService.createBank(body);
  }
  // 获取题库列表
  @Get('')
  getBankList(@Query() query: getBankDto) {
    return this.bankService.getBankList(query);
  }
  // 获取所有分类
  @Get('category')
  getAllCategories() {
    return this.bankService.getAllCategories();
  }
  // 获取用户收藏的题库列表
  @Get('collection')
  getCollectedBanks(@CurrentUser() user: AuthUser) {
    return this.bankService.getCollectedBanks(user.id);
  }
  // 创建学科
  @Post('discipline')
  createDiscipline(@Body() body: { discipline: string | string[] }) {
    return this.bankService.createDiscipline(body.discipline);
  }
  // 创建分类
  @Post('category')
  createCategory(@Body() body: { category: string | string[] }) {
    return this.bankService.createCategory(body.category);
  }
  // 收藏题库
  @Post('collection/:id')
  collectBank(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.bankService.collectBank(id, user.id);
  }
  // 取消收藏题库
  @Delete('collection/:id')
  cancelCollectBank(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.bankService.cancelCollectBank(id, user.id);
  }
  // 获取用户是否收藏了题库
  @Get('collection/:id/exist')
  isCollected(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.bankService.isCollected(id, user.id);
  }
  @Get('edit/:bankId')
  getDetailedQuestions(
    @Param('bankId', ParseIntPipe) bankId: number,
    @Query('disciplineId', ParseIntPipe) disciplineId: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.bankService.getDetailedQuestions(bankId, disciplineId, user.id);
  }
  // 获取题库详情
  @Public()
  @Get(':id')
  getBankDetail(@Param('id', ParseIntPipe) id: number) {
    return this.bankService.getBankDetail(id);
  }
}
