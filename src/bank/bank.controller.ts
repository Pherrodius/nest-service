import {
  Controller,
  ParseIntPipe,
  Query,
  Get,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { BankService } from './bank.service';
import { createBankDto, getBankDto } from './dto';

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
  // 获取题库详情
  @Get(':id')
  getBankDetail(@Param('id', ParseIntPipe) id: number) {
    return this.bankService.getBankDetail(id);
  }
  // 创建学科
  @Post('discipline')
  createDiscipline(@Body() body: { discipline: string | string[] }) {
    return this.bankService.createDiscipline(body.discipline);
  }
}
