import { PrismaService } from '@/prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UploadFileDto } from './dto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { decodeOriginalName } from './utils';

@Injectable()
export class FileService {
  constructor(private readonly prismaService: PrismaService) {}
  async getFiles() {
    return await this.prismaService.document.findMany({
      where: {
        url: {
          startsWith: '/uploads/docs/',
        },
      },
      include: {
        uploader: true,
      },
      orderBy: {
        createdTime: 'desc',
      },
    });
  }
  async uploadFile(
    file: Express.Multer.File,
    dto: UploadFileDto,
    uploaderId: number,
  ) {
    try {
      return await this.prismaService.document.create({
        data: {
          uploader: { connect: { id: uploaderId } },
          filename: file.filename,
          originalName: decodeOriginalName(file.originalname),
          url: `/uploads/docs/${file.filename}`,
          mimeType: file.mimetype,
          size: file.size,
          content: dto.content,
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
  async deleteFile(id: number, userId: number) {
    const file = await this.prismaService.document.findUnique({
      where: { id },
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    if (file.uploaderId !== userId) {
      throw new BadRequestException(
        'You are not authorized to delete this file',
      );
    }
    try {
      fs.unlink(process.cwd() + file.url).catch(() => {
        console.error('Failed to delete file after deletion:', file.url);
      });
      return await this.prismaService.document.delete({ where: { id } });
    } catch (err) {
      console.error('Error deleting file:', err);
      throw new BadRequestException('Failed to delete file');
    }
  }
}
