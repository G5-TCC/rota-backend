import { Injectable, BadRequestException } from '@nestjs/common';
import { ITwoFactorStrategy } from '../interfaces/two-factor-strategy.interface';
import { EmailTwoFactorStrategy } from '../strategies/two-factor/email.strategy';

@Injectable()
export class TwoFactorStrategyRegistry {
  private readonly strategies: Map<string, ITwoFactorStrategy> = new Map();

  constructor(emailStrategy: EmailTwoFactorStrategy) {
    this.register(emailStrategy);
  }

  private register(strategy: ITwoFactorStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  getStrategy(name: string): ITwoFactorStrategy {
    const strategy = this.strategies.get(name);
    if (!strategy) {
      throw new BadRequestException(`2FA strategy '${name}' not found`);
    }
    return strategy;
  }
}
