import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import {
  ChangePasswordDto,
  ChangePhoneDto,
  LoginByNameDto,
  LoginByPhoneDto,
} from './dto';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { ParseIntPipe } from '@nestjs/common';
import { Public } from '@/auth/public.decorator';
import { CurrentUser } from '@/auth/current-user.decorator';
import type { AuthUser } from '@/auth/types';
import { CollectionType } from 'generated/prisma/enums';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { mkdirSync } from 'fs';
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  private static readonly avatarUploadDir = './uploads/avatars';

  @Delete('/testhistory/:id')
  deleteTestHistory(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.userService.deleteTestHistory(id, user.id);
  }
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('collections')
  getGroupedCollections(
    @Query() query: { type: CollectionType },
    @CurrentUser() user: AuthUser,
  ) {
    return this.userService.getGroupedCollection(query.type, user.id);
  }

  @Get('files')
  getMyFiles(@CurrentUser() user: AuthUser) {
    return this.userService.getMyFiles(user.id);
  }

  @Get('profile')
  getProfile(@CurrentUser() user: AuthUser) {
    return this.userService.getProfile(user.id);
  }

  @Put('profile')
  updateProfile(@CurrentUser() user: AuthUser, @Body() body: UpdateUserDto) {
    return this.userService.updateProfile(user.id, body);
  }

  @Put('password')
  changePassword(
    @CurrentUser() user: AuthUser,
    @Body() body: ChangePasswordDto,
  ) {
    return this.userService.changePassword(user.id, body);
  }

  @Put('phone')
  changePhone(@CurrentUser() user: AuthUser, @Body() body: ChangePhoneDto) {
    return this.userService.changePhone(user.id, body);
  }

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          mkdirSync(UserController.avatarUploadDir, { recursive: true });
          cb(null, UserController.avatarUploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueName + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new BadRequestException('只能上传图片文件'), false);
          return;
        }

        cb(null, true);
      },
      limits: {
        fileSize: 1024 * 1024 * 5,
      },
    }),
  )
  uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthUser,
  ) {
    if (!file) {
      throw new BadRequestException('请选择头像文件');
    }

    return this.userService.updateAvatar(
      user.id,
      `/uploads/avatars/${file.filename}`,
    );
  }

  @Get('banks')
  getMyBanks(@CurrentUser() user: AuthUser) {
    return this.userService.getMyBank(user.id);
  }

  @Get('testHistory')
  getTestHistory(@CurrentUser() user: AuthUser) {
    return this.userService.getTestHistory(user.id);
  }

  @Get('overview')
  getOverview(@CurrentUser() user: AuthUser) {
    return this.userService.getOverview(user.id);
  }

  @Get('search')
  search(@Query('id', ParseIntPipe) id: number) {
    return this.userService.search(id);
  }

  @Post()
  @Public()
  create(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }
  @Post('login')
  @Public()
  login(@Body() body: LoginByPhoneDto | LoginByNameDto) {
    return this.userService.login(body);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateUserDto) {
    return this.userService.update(id, body);
  }
}
