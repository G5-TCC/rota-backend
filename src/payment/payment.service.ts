import { Injectable, Logger, BadRequestException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCheckoutDto } from './dtos/create-checkout.dto';
import { Plan, TransactionType, TransactionStatus } from '@prisma/client';
import { PAYMENT_GATEWAY } from './interfaces/payment-gateway.interface';
import type { IPaymentGateway } from './interfaces/payment-gateway.interface';
import { PaymentCalculatorService } from './services/payment-calculator.service';

type TransactionMetadata = {
  plan?: Plan;
};

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @Inject(PAYMENT_GATEWAY) private readonly gateway: IPaymentGateway,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly calculator: PaymentCalculatorService,
  ) {}

  async createCheckout(userId: string, dto: CreateCheckoutDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('Usuário não encontrado');

    const { amount, productName, externalId } = this.calculator.calculate(dto);
    
    const product = await this.gateway.createProduct(externalId, productName, amount);
    
    const isSubscription = dto.type === TransactionType.PLAN_SUBSCRIPTION;
    const items = [{ id: product.id, quantity: 1 }];
    const customer = {
      email: user.email,
      ...(dto.customerName ? { name: dto.customerName } : {}),
      ...(dto.taxId ? { taxId: dto.taxId } : {}),
    };
    const urls = {
      returnUrl: dto.returnUrl || this.configService.get<string>('APP_RETURN_URL'),
      completionUrl: dto.completionUrl || this.configService.get<string>('APP_COMPLETION_URL'),
    };

    const checkoutData = isSubscription 
      ? await this.gateway.createSubscription(items, customer, urls)
      : await this.gateway.createCheckout(items, customer, urls);

    await this.prisma.transaction.create({
      data: {
        externalId: checkoutData.id,
        userId,
        amount,
        type: dto.type,
        status: TransactionStatus.PENDING,
        metadata: { plan: dto.plan },
      },
    });

    return { url: checkoutData.url };
  }

  async simulatePayment(externalId: string) {
    try {
      await this.gateway.simulatePayment(externalId);
      return { message: 'Simulação enviada com sucesso' };
    } catch (error) {
      this.logger.error('Erro ao simular pagamento', error.response?.data || error.message);
      throw new BadRequestException('Falha na simulação. Verifique se o ID existe e se você está em modo sandbox.');
    }
  }

  async handleWebhook(signature: string, rawBody: string) {
    if (!this.gateway.verifyWebhook(signature, rawBody)) {
      this.logger.warn('Webhook com assinatura inválida recebido');
      throw new BadRequestException('Assinatura inválida');
    }

    const payload = JSON.parse(rawBody);
    const { event, data } = payload;

    if (event === 'checkout.completed') {
      await this.processSuccessfulPayment(data.id);
    }
  }

  private async processSuccessfulPayment(externalId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { externalId },
      include: { user: true },
    });

    if (!transaction) {
      this.logger.error(`Transação ${externalId} não encontrada no banco`);
      return;
    }

    if (transaction.status === TransactionStatus.PAID) return;

    const metadata = transaction.metadata as TransactionMetadata;

    await this.prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { status: TransactionStatus.PAID },
      });

      if (transaction.type === TransactionType.PLAN_SUBSCRIPTION) {
        if (metadata.plan) {
          await tx.user.update({
            where: { id: transaction.userId },
            data: { plan: metadata.plan },
          });
        }
      }
    });

    this.logger.log(`Pagamento confirmado para usuário ${transaction.userId}`);
  }
}
