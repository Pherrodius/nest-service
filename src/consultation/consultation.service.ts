import { Injectable } from '@nestjs/common';
import { LlmService } from '@/llm/llm.service';
import { PrismaService } from '@/prisma/prisma.service';
import { QuestionService } from '@/question/question.service';
import { CreateConsultationDto } from './dto';

@Injectable()
export class ConsultationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly questionService: QuestionService,
    private readonly llmService: LlmService,
  ) {}

  async getHistory(userId: number) {
    const history = await this.prismaService.questionConsultation.findMany({
      where: { userId },
      orderBy: { createdTime: 'desc' },
      take: 10,
    });

    return history.reverse();
  }

  clearHistory(userId: number) {
    return this.prismaService.questionConsultation.deleteMany({
      where: { userId },
    });
  }

  async createStream(
    questionId: number,
    dto: CreateConsultationDto,
    userId: number,
    onDelta: (content: string) => void,
    isClosed: () => boolean,
  ) {
    const question = await this.questionService.getQuestion(questionId);
    const context = (await this.getHistory(userId)).map((item) => ({
      role: item.role,
      content: item.content,
    }));

    let fulltext = '';
    const stream = await this.llmService.chat.completions.create({
      model: 'deepseek-v4-pro',
      messages: [
        {
          role: 'system',
          content:
            '你是一个专业的刷题网站的AI答疑助手，回答要清晰有逻辑，尽量引导用户理解问题。你会收到题目和用户提问，需要结合问题本身和你的知识进行解答。',
        },
        ...context,
        {
          role: 'user',
          content: `题干：${question?.content}\n\n${
            question?.options?.length
              ? `选项：${JSON.stringify(
                  question.options.map((item) => ({
                    key: item.key,
                    text: item.text,
                  })),
                )}`
              : ''
          }\n\n我的问题是：${dto.content}`,
        },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      if (isClosed()) break;

      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fulltext += content;
        onDelta(content);
      }
    }

    if (fulltext.trim()) {
      await this.prismaService.$transaction([
        this.prismaService.questionConsultation.create({
          data: {
            userId,
            content: dto.content.trim(),
            role: 'user',
          },
        }),
        this.prismaService.questionConsultation.create({
          data: {
            userId,
            content: fulltext.trim(),
            role: 'assistant',
          },
        }),
      ]);
    }
  }
}
