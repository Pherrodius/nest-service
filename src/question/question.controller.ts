import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '@/auth/current-user.decorator';
import type { AuthUser } from '@/auth/types';
import {
  createCollectionDto,
  createQuestionDto,
  deleteAllCollectionsDto,
  getCollectionDto,
  getQuestionDto,
  getResolutionsDto,
  isCollectionExistDto,
  submitTestDto,
} from './dto';
import { QuestionService } from './question.service';

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  createQuestion(@Body() body: createQuestionDto | createQuestionDto[]) {
    if (Array.isArray(body)) {
      return this.questionService.createManyQuestions(body);
    }

    return this.questionService.createQuestion(body);
  }

  @Get()
  getQuestions(@Query() query: getQuestionDto) {
    return this.questionService.getQuestions(query);
  }

  @Post('collection')
  createCollection(
    @Body() body: createCollectionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.questionService.createCollection(body, user.id);
  }

  @Get('collection')
  getCollection(
    @Query() query: getCollectionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.questionService.getCollection(query, user.id);
  }

  @Delete('collection/:id')
  deleteCollection(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.questionService.deleteCollection(id, user.id);
  }

  @Delete('collection')
  deleteAllCollections(
    @Query() query: deleteAllCollectionsDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.questionService.deleteAllCollections(query, user.id);
  }

  @Get('collection/exist')
  isCollectionExist(
    @Query() query: isCollectionExistDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.questionService.isCollectionExist(query, user.id);
  }

  @Post('submit')
  submitTest(@Body() body: submitTestDto, @CurrentUser() user: AuthUser) {
    return this.questionService.submitTest(body, user.id);
  }
  @Get('testHistory')
  getTestHistory(@CurrentUser() user: AuthUser) {
    return this.questionService.getTestHistory(user.id);
  }
  @Get('resolution')
  getResolutions(
    @Query() query: getResolutionsDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.questionService.getResolutions(query, user.id);
  }

  @Get(':id')
  getQuestion(@Param('id', ParseIntPipe) id: number) {
    return this.questionService.getQuestion(id);
  }
}
