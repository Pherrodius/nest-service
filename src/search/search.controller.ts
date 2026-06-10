import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import {
  SearchBanksDto,
  SearchDocumentsDto,
  SearchQuestionsDto,
  SearchUsersDto,
} from './dto';
import { Public } from '@/auth/public.decorator';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}
  @Public()
  @Get('question')
  async searchQuestion(@Query() query: SearchQuestionsDto) {
    return this.searchService.searchQuestions(query);
  }
  @Public()
  @Get('bank')
  async searchBank(@Query() query: SearchBanksDto) {
    return this.searchService.searchBanks(query);
  }
  @Public()
  @Get('document')
  async searchDocument(@Query() query: SearchDocumentsDto) {
    return this.searchService.searchDocuments(query);
  }
  @Public()
  @Get('user')
  async searchUser(@Query() query: SearchUsersDto) {
    return this.searchService.searchUsers(query);
  }
}
