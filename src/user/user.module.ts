import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { UserController } from './user.controller';
import { AuthModule } from '@/auth/auth.module';

@Module({
  providers: [UserService],
  imports: [PrismaModule, AuthModule],
  controllers: [UserController],
})
export class UserModule {}
