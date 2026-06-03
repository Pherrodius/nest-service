import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { QuestionModule } from '@/question/question.module';
import { LlmModule } from '@/llm/llm.module';

@Module({
  imports: [PrismaModule, QuestionModule, LlmModule],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
