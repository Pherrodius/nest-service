import { PrismaService } from '@/prisma/prisma.service';
import { LlmService } from '@/llm/llm.service';
import { QuestionService } from '@/question/question.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LLMAnalysisFileDto, UploadFileDto } from './dto';
import { promises as fs } from 'fs';
import { extname, join } from 'path';
import { decodeOriginalName } from './utils';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { createQuestionDto } from '@/question/dto';
import { DocumentStatus } from 'generated/prisma/enums';
@Injectable()
export class FileService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly llmService: LlmService,
    private readonly questionService: QuestionService,
  ) {}
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
  async analysisFile(id: number, userId: number) {
    const file = await this.prismaService.document.findUnique({
      where: { id },
    });
    if (!file) {
      throw new NotFoundException('文件不存在');
    }
    if (file.uploaderId !== userId) {
      throw new UnauthorizedException('无权操作');
    }
    const path = join(process.cwd(), file.url);
    const { fileTypeFromFile } = await import('file-type');
    const detectedType = await fileTypeFromFile(path);
    const buffer = await fs.readFile(path);
    const ext =
      detectedType?.ext ||
      extname(file.originalName || file.filename)
        .slice(1)
        .toLowerCase();
    switch (ext) {
      case 'txt':
        return buffer.toString();
      case 'pdf': {
        const pdfParse = new PDFParse({ data: buffer });
        const result = await pdfParse.getText();
        return result.text;
      }
      case 'docx': {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
      }
      case 'doc':
        throw new BadRequestException('请转换为docx格式');
      default:
        throw new BadRequestException('该文件类型暂不支持解析');
    }
  }
  async LLMAnalysisFile(id: number, dto: LLMAnalysisFileDto, userId: number) {
    try {
      const bank = await this.prismaService.bank.findUnique({
        where: { id: dto.bankId },
        include: { questions: true },
      });
      const discipline = await this.prismaService.discipline.findUnique({
        where: { id: dto.disciplineId },
      });
      if (!bank) throw new NotFoundException('题库不存在');
      if (bank.creatorId !== userId)
        throw new UnauthorizedException('无权操作');
      if (!discipline) throw new NotFoundException('学科不存在');
      const fileContent = await this.analysisFile(id, userId);
      void this.LLMGenerateQuestion({
        documentId: id,
        fileContent,
        bankName: bank.name,
        disciplineName: discipline.name,
        historyQuestions: bank.questions.map((q) => q.content),
        prompt: dto.prompt,
      });
      return await this.prismaService.document.update({
        where: { id },
        data: { status: DocumentStatus.Pending },
      });
    } catch (error) {
      await this.prismaService.document.update({
        where: { id },
        data: { status: DocumentStatus.Rejected },
      });
      console.error(error);
      throw new BadRequestException('无法生成问题');
    }
  }
  async LLMGenerateQuestion(data: {
    documentId: number;
    fileContent: string;
    bankName: string;
    disciplineName: string;
    historyQuestions: string[];
    prompt?: string;
  }) {
    try {
      const completion = await this.llmService.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              '你是一个专业的刷题网站AI助手，你需要从文件解析出的文本中整理关键知识点并进行命题，题目类型仅限单选题，多选题和判断题;若文件本身即是题库，请直接从文件中解析出题目，并转化为合法格式输出，若文件中包含其他类型题目，可适度转化为这三种题型。最大输出题目的数量为80，绝对不能超出数量限制。若用户没有明确要求，尽量把出题数量控制在40以内。若文件内容显著与网站主题无关,直接返回空值。',
          },
          {
            role: 'system',
            content: `输出格式为json格式，输出示例为： 
            ${JSON.stringify([
              {
                type: 'SingleChoice',
                content:
                  '在关系型数据库中，SQL 语句 SELECT 主要用于执行哪类操作？',
                options: [
                  { key: 'A', text: '查询数据' },
                  { key: 'B', text: '删除表结构' },
                  { key: 'C', text: '创建索引' },
                  { key: 'D', text: '修改用户权限' },
                ],
                answer: 'A',
                bank: '计算机基础题库',
                discipline: '数据库',
                riskLevel: 1,
                explanation: 'SELECT 语句用于从数据库表中查询数据。',
              },
              {
                type: 'MultiChoice',
                content: '以下哪些属于 HTTP 请求方法？',
                options: [
                  { key: 'A', text: 'GET' },
                  { key: 'B', text: 'POST' },
                  { key: 'C', text: 'PUSH' },
                  { key: 'D', text: 'DELETE' },
                ],
                answer: ['A', 'B', 'D'],
                bank: '计算机基础题库',
                discipline: '计算机网络',
                riskLevel: 2,
                explanation:
                  'GET、POST、DELETE 都是常见 HTTP 请求方法，PUSH 不是标准 HTTP 请求方法。',
              },
              {
                type: 'TrueFalse',
                content: '栈是一种先进先出的线性数据结构。',
                options: [
                  { key: 'A', text: '正确' },
                  { key: 'B', text: '错误' },
                ],
                answer: 'B',
                bank: '计算机基础题库',
                discipline: '数据结构',
                riskLevel: 1,
                explanation: '栈是后进先出，队列才是先进先出。',
              },
            ])} 其中risklevel字段仅能设置1，2，3;answer字段仅能设置A，B，C，D。;explanation字段以中文为主要语言输出。bank和discipline字段的取值以用户输入为准。从知识点中提取出的题目的默认题型分布是2：1：1，单选题是2，多选题是1，判断题是1。难度分布默认按照2：2：1分布。文件本身直接提取出的题目不受此数量占比限制。实际题型分布和难度分布以用户需求为准。尽量避免与原题库中的题干重复。`,
          },
          {
            role: 'user',
            content: `${JSON.stringify(data.prompt) || '请从文件中解析出题目'},题库名称是${data.bankName},学科名称是${data.disciplineName},原题库中已有题目为${JSON.stringify(data.historyQuestions)},文件内容如下：${data.fileContent}`,
          },
        ],
        model: 'deepseek-v4-pro',
        stream: false,
        response_format: { type: 'json_object' },
      });
      if (!completion.choices[0].message.content)
        throw new BadRequestException('无法生成问题');
      await this.questionService.createManyQuestions(
        JSON.parse(
          completion.choices[0].message.content,
        ) as createQuestionDto[],
      );
      await this.prismaService.document.update({
        where: { id: data.documentId },
        data: { status: DocumentStatus.Resolved },
      });
      return completion.choices[0].message.content;
    } catch (error) {
      await this.prismaService.document.update({
        where: { id: data.documentId },
        data: { status: DocumentStatus.Rejected },
      });
      console.error(error);
      throw new BadRequestException('无法生成问题');
    }
  }
}
