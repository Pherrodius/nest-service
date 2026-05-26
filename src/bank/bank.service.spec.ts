import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@/prisma/prisma.service';
import { BankService } from './bank.service';

describe('BankService', () => {
  let service: BankService;
  let prismaService: {
    bank: {
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaService = {
      bank: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<BankService>(BankService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('does not filter out uncategorized banks when no category is provided', async () => {
    await service.getBankList({});

    expect(prismaService.bank.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          categoryId: undefined,
          category: undefined,
        }),
      }),
    );
  });

  it('filters banks by category id when provided', async () => {
    await service.getBankList({ categoryId: 1 });

    expect(prismaService.bank.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          categoryId: 1,
          category: undefined,
        }),
      }),
    );
  });

  it('filters banks by category name only when provided', async () => {
    await service.getBankList({ categoryName: 'Frontend' });

    expect(prismaService.bank.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: { name: { contains: 'Frontend' } },
        }),
      }),
    );
  });
});
