import { Injectable } from '@nestjs/common';
import { ITwoFactorStrategy } from '../../interfaces/two-factor-strategy.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TwoFactorCodeGeneratedEvent } from '../../events/two-factor-code-generated.event';

@Injectable()
export class EmailTwoFactorStrategy implements ITwoFactorStrategy {
  readonly name = 'email';

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async generateCode(): Promise<string> {
    // Gera um código numérico de 6 dígitos
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendCode(userEmail: string, code: string): Promise<void> {
    this.eventEmitter.emit(
      'two.factor.code.generated',
      new TwoFactorCodeGeneratedEvent(userEmail, code),
    );
  }

  verifyCode(providedCode: string, storedCode: string): boolean {
    return providedCode === storedCode;
  }
}
