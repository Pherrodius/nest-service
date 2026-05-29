import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class SearchService {
  constructor(private prismaService: PrismaService) {}
  async searchQuestions(dto: SearchQuestionsDto) {}
}
