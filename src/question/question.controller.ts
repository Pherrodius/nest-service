import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Delete,
} from '@nestjs/common';
import {
  checkAnswerDto,
  createCollectionDto,
  createBankDto,
  getBankDto,
  getCollectionDto,
} from './dto';
import { QuestionService } from './question.service';
import { createQuestionDto, getQuestionDto } from './dto';
import { ParseIntPipe } from '@nestjs/common';
@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}
  @Post()
  createQuestion(@Body() body: createQuestionDto | createQuestionDto[]) {
    if (Array.isArray(body))
      return this.questionService.createManyQuestions(body);
    else {
      return this.questionService.createQuestion(body);
    }
  }
  @Get()
  getQuestions(@Query() query: getQuestionDto) {
    return this.questionService.getQuestions(query);
  }
  @Post('bank')
  createBank(@Body() body: createBankDto) {
    return this.questionService.createBank(body);
  }
  @Get('bank')
  getBankList(@Query() query: getBankDto) {
    return this.questionService.getBankList(query);
  }
  @Post('collection')
  createCollection(@Body() body: createCollectionDto) {
    return this.questionService.createCollection(body);
  }
  @Get('collection')
  getCollection(@Query() query: getCollectionDto) {
    return this.questionService.getCollection(query);
  }
  @Delete('collection/:id')
  deleteCollection(@Param('id', ParseIntPipe) id: number) {
    return this.questionService.deleteCollection(id);
  }
  @Post('check')
  checkAnswer(@Body() body: checkAnswerDto | checkAnswerDto[]) {
    if (Array.isArray(body)) return this.questionService.checkManyAnswers(body);
    else {
      return this.questionService.checkAnswer(body);
    }
  }
  @Get(':id')
  getQuestion(@Param('id', ParseIntPipe) id: number) {
    return this.questionService.getQuestion(id);
  }
}
