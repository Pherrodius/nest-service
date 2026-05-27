import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Response } from 'express';
import { UploadFileDto } from './dto';
import { FileService } from './file.service';
import { CurrentUser } from '@/auth/current-user.decorator';
import type { AuthUser } from '@/auth/types';
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueName + extname(file.originalname));
        },
      }),
      limits: {
        fileSize: 1024 * 1024 * 10, // 10MB
      },
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File,
    dto: UploadFileDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.fileService.uploadFile(file, dto, user.id);
  }

  @Get('download/:id')
  async download(@Param('id') id: number, @Res() res: Response) {
    const fileUrl = await this.fileService.downloadFile(id);
    return res.download(fileUrl);
  }
}
