import { Module } from '@nestjs/common';
import { LlmModule } from '@/llm/llm.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { QuestionModule } from '@/question/question.module';
import { ConsultationController } from './consultation.controller';
import { ConsultationService } from './consultation.service';

@Module({
  imports: [PrismaModule, LlmModule, QuestionModule],
  controllers: [ConsultationController],
  providers: [ConsultationService],
})
export class ConsultationModule {}
