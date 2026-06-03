import { Injectable } from '@nestjs/common';
import Openai from 'openai';
@Injectable()
export class LlmService extends Openai {
  constructor() {
    super({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com',
    });
  }
}
