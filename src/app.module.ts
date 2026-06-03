import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { QuestionModule } from './question/question.module';
import { BankModule } from './bank/bank.module';
import { AuthModule } from './auth/auth.module';
import { FileModule } from './file/file.module';
import { SearchModule } from './search/search.module';
import { LlmModule } from './llm/llm.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, QuestionModule, BankModule, FileModule, SearchModule, LlmModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
