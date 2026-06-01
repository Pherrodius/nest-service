import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import {
  SearchBanksDto,
  SearchDocumentsDto,
  SearchQuestionsDto,
  SearchUsersDto,
} from './dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}
  @Get('question')
  async searchQuestion(@Query() query: SearchQuestionsDto) {
    return this.searchService.searchQuestions(query);
  }

  @Get('bank')
  async searchBank(@Query() query: SearchBanksDto) {
    return this.searchService.searchBanks(query);
  }

  @Get('document')
  async searchDocument(@Query() query: SearchDocumentsDto) {
    return this.searchService.searchDocuments(query);
  }

  @Get('user')
  async searchUser(@Query() query: SearchUsersDto) {
    return this.searchService.searchUsers(query);
  }
}
