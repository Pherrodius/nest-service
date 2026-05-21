import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { QuestionModule } from './question/question.module';
import { BankModule } from './bank/bank.module';

@Module({
  imports: [PrismaModule, UserModule, QuestionModule, BankModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
