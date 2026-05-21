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
  deleteAllCollectionsDto,
  getCollectionDto,
  getResolutionsDto,
  isCollectionExistDto,
} from './dto';
import { QuestionService } from './question.service';
import { createQuestionDto, getQuestionDto } from './dto';
import { ParseIntPipe } from '@nestjs/common';
@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}
  // 创建问题
  @Post()
  createQuestion(@Body() body: createQuestionDto | createQuestionDto[]) {
    if (Array.isArray(body))
      return this.questionService.createManyQuestions(body);
    else {
      return this.questionService.createQuestion(body);
    }
  }
  // 获取问题列表
  @Get()
  getQuestions(@Query() query: getQuestionDto) {
    return this.questionService.getQuestions(query);
  }
  // 创建收藏
  @Post('collection')
  createCollection(@Body() body: createCollectionDto) {
    return this.questionService.createCollection(body);
  }
  // 获取收藏
  @Get('collection')
  getCollection(@Query() query: getCollectionDto) {
    return this.questionService.getCollection(query);
  }
  // 删除收藏
  @Delete('collection/:id')
  deleteCollection(@Param('id', ParseIntPipe) id: number) {
    return this.questionService.deleteCollection(id);
  }
  // 删除所有收藏
  @Delete('collection')
  deleteAllCollections(@Query() query: deleteAllCollectionsDto) {
    return this.questionService.deleteAllCollections(query);
  }
  // 检查收藏是否存在
  @Get('collection/exist')
  isCollectionExist(@Query() query: isCollectionExistDto) {
    return this.questionService.isCollectionExist(query);
  }
  // 检查答案
  @Post('check')
  checkAnswer(@Body() body: checkAnswerDto | checkAnswerDto[]) {
    if (Array.isArray(body)) return this.questionService.checkManyAnswers(body);
    else {
      return this.questionService.checkAnswer(body);
    }
  }
  // 获取问题
  @Get(':id')
  getQuestion(@Param('id', ParseIntPipe) id: number) {
    return this.questionService.getQuestion(id);
  }
  // 获取解决记录
  @Get('resolution')
  getResolutions(@Query() query: getResolutionsDto) {
    return this.questionService.getResolutions(query);
  }
}
