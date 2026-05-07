import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { checkAnswerDto, createCollectionDto, getCollectionDto } from './dto';
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
  getQuestions(@Body() body: getQuestionDto) {
    return this.questionService.getQuestions(body);
  }
  @Get(':id')
  getQuestion(@Param('id', ParseIntPipe) id: number) {
    return this.questionService.getQuestion(id);
  }
  @Post('check')
  checkAnswer(@Body() body: checkAnswerDto | checkAnswerDto[]) {
    if (Array.isArray(body)) return this.questionService.checkManyAnswers(body);
    else {
      return this.questionService.checkAnswer(body);
    }
  }
  @Post('collection')
  createCollection(@Body() body: createCollectionDto) {
    return this.questionService.createCollection(body);
  }
  @Get('collection')
  getCollection(@Body() body: getCollectionDto) {
    return this.questionService.getCollection(body);
  }
}
