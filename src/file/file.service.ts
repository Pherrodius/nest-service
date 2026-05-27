import { PrismaService } from '@/prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UploadFileDto } from './dto';
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class FileService {
  constructor(private readonly prismaService: PrismaService) {}

  uploadFile(
    file: Express.Multer.File,
    dto: UploadFileDto,
    uploaderId: number,
  ) {
    try {
      return this.prismaService.document.create({
        data: {
          uploader: { connect: { id: uploaderId } },
          filename: file.filename,
          originalName: file.originalname,
          url: `/uploads/${file.filename}`,
          mimeType: file.mimetype,
          size: file.size,
          title: dto.title,
          content: dto.content,
          category: {
            connectOrCreate: {
              where: { name: dto.category },
              create: { name: dto.category },
            },
          },
        },
      });
    } catch (error) {
      fs.unlink(file.path).catch(() => {
        console.error('Failed to delete file after upload error:', file.path);
      });
      console.error('Error uploading file:', error);
      throw new BadRequestException('Failed to upload file');
    }
  }
  async downloadFile(id: number) {
    const file = await this.prismaService.document.findUnique({
      where: { id },
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    return join(process.cwd(), file.url);
  }
}
