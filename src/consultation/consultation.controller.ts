import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { CurrentUser } from '@/auth/current-user.decorator';
import type { AuthUser } from '@/auth/types';
import { ConsultationService } from './consultation.service';
import { CreateConsultationDto } from './dto';

@Controller('consultation')
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  @Get('history')
  getHistory(@CurrentUser() user: AuthUser) {
    return this.consultationService.getHistory(user.id);
  }

  @Delete('history')
  clearHistory(@CurrentUser() user: AuthUser) {
    return this.consultationService.clearHistory(user.id);
  }

  @Post(':questionId/stream')
  async createStream(
    @Param('questionId', ParseIntPipe) questionId: number,
    @Body() body: CreateConsultationDto,
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser() user: AuthUser,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    let closed = false;
    req.on('close', () => {
      closed = true;
    });

    try {
      await this.consultationService.createStream(
        questionId,
        body,
        user.id,
        (content) => {
          res.write(`data:${JSON.stringify({ type: 'delta', content })}\n\n`);
        },
        () => closed,
      );

      if (!closed) {
        res.write(`data:${JSON.stringify({ type: 'done' })}\n\n`);
      }
    } catch (error) {
      if (!closed) {
        res.write(
          `data:${JSON.stringify({
            type: 'error',
            message: '咨询失败',
          })}\n\n`,
        );
      }
      console.error(error);
    } finally {
      res.end();
    }
  }
}
