import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { AbacatePayGateway } from './gateways/abacatepay.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { TransactionType } from '@prisma/client';
import { PaymentCalculatorService } from './services/payment-calculator.service';

describe('PaymentService', () => {
  let service: PaymentService;
  let gateway: jest.Mocked<AbacatePayGateway>;
  let prisma: jest.Mocked<PrismaService>;
  let calculator: jest.Mocked<PaymentCalculatorService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: 'PAYMENT_GATEWAY',
          useValue: {
            createProduct: jest.fn(),
            createCheckout: jest.fn(),
            createSubscription: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: { findUnique: jest.fn() },
            transaction: { create: jest.fn() },
          },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
        {
          provide: PaymentCalculatorService,
          useValue: { calculate: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    gateway = module.get('PAYMENT_GATEWAY');
    prisma = module.get(PrismaService);
    calculator = module.get(PaymentCalculatorService);
  });

  it('should create a checkout for a plan', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
    } as any);
    calculator.calculate.mockReturnValue({
      amount: 4990,
      productName: 'Plano PRO',
      externalId: 'PRO',
    });
    gateway.createProduct.mockResolvedValue({ id: 'p1', externalId: 'PRO' });
    gateway.createSubscription.mockResolvedValue({
      id: 'ch1',
      url: 'http://url',
    });
    prisma.transaction.create.mockResolvedValue({ id: 't1' } as any);

    const result = await service.createCheckout('u1', {
      type: TransactionType.PLAN_SUBSCRIPTION,
      plan: 'PRO',
    } as any);

    expect(result.url).toBe('http://url');
    expect(calculator.calculate).toHaveBeenCalled();
    expect(gateway.createProduct).toHaveBeenCalledWith(
      'PRO',
      'Plano PRO',
      4990,
    );
  });
});
