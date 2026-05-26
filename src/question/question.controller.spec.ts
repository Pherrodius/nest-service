import { Test, TestingModule } from '@nestjs/testing';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';

describe('QuestionController', () => {
  let controller: QuestionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionController],
      providers: [
        {
          provide: QuestionService,
          useValue: {
            createQuestion: jest.fn(),
            createManyQuestions: jest.fn(),
            getQuestions: jest.fn(),
            createCollection: jest.fn(),
            getCollection: jest.fn(),
            deleteCollection: jest.fn(),
            deleteAllCollections: jest.fn(),
            isCollectionExist: jest.fn(),
            checkAnswer: jest.fn(),
            checkManyAnswers: jest.fn(),
            getResolutions: jest.fn(),
            getQuestion: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<QuestionController>(QuestionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
