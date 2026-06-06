import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { LlmModule } from '@/llm/llm.module';

@Module({
  imports: [PrismaModule, LlmModule],
  controllers: [QuestionController],
  providers: [QuestionService],
  exports: [QuestionService],
})
export class QuestionModule {}
