import { Injectable, BadRequestException } from '@nestjs/common';
import { Plan, TransactionType } from '@prisma/client';
import { CreateCheckoutDto } from '../dtos/create-checkout.dto';

const PLAN_PRICES = {
  [Plan.GRATIS]: 0,
  [Plan.PRO]: 4990,
};

export interface PaymentDetails {
  amount: number;
  productName: string;
  externalId: string;
}

@Injectable()
export class PaymentCalculatorService {
  calculate(dto: CreateCheckoutDto): PaymentDetails {
    if (dto.type === TransactionType.PLAN_SUBSCRIPTION) {
      if (!dto.plan) {
        throw new BadRequestException('Plano não informado para assinatura');
      }
      return {
        amount: PLAN_PRICES[dto.plan],
        productName: `Plano ${dto.plan}`,
        externalId: dto.plan,
      };
    }

    throw new BadRequestException('Tipo de transação inválido');
  }
}
