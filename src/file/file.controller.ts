import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Res,
  Body,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Response } from 'express';
import { UploadFileDto } from './dto';
import { FileService } from './file.service';
import { CurrentUser } from '@/auth/current-user.decorator';
import type { AuthUser } from '@/auth/types';
import { Public } from '@/auth/public.decorator';
import { decodeOriginalName } from './utils';
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}
  @Get()
  getFiles() {
    return this.fileService.getFiles();
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/docs',
        filename: (req, file, cb) => {
          const originalName = decodeOriginalName(file.originalname);
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueName + extname(originalName));
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('application/')) {
          cb(new BadRequestException('只能上传文件'), false);
          return;
        }
        cb(null, true);
      },
      limits: {
        fileSize: 1024 * 1024 * 10, // 10MB
      },
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.fileService.uploadFile(file, dto, user.id);
  }
  @Public()
  @Get('download/:id')
  async download(@Param('id') id: number, @Res() res: Response) {
    const fileUrl = await this.fileService.downloadFile(id);
    return res.download(fileUrl);
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: number, @CurrentUser() user: AuthUser) {
    return this.fileService.deleteFile(id, user.id);
  }
}
