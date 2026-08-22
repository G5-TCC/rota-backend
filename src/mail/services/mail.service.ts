import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MailOptions } from '../mail.interfaces';

@Injectable()
export class MailService {
  constructor(@InjectQueue('mail') private mailQueue: Queue) {}

  async sendWelcomeEmail(to: string, alias: string, requestId?: string) {
    const options: MailOptions = {
      to,
      subject: 'Bem-vindo ao Nosso Sistema!',
      template: 'welcome',
      context: { alias },
      requestId,
    };

    await this.mailQueue.add('welcome', options, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });
  }

  async sendVerificationEmail(to: string, token: string, requestId?: string) {
    const options: MailOptions = {
      to,
      subject: 'Verifique seu e-mail',
      template: 'verify-email',
      context: { token },
      requestId,
    };

    await this.mailQueue.add('verify-email', options, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
  }

  async sendPasswordResetEmail(to: string, token: string, requestId?: string) {
    const options: MailOptions = {
      to,
      subject: 'Redefinição de Senha',
      template: 'password-reset',
      context: { token },
      requestId,
    };

    await this.mailQueue.add('password-reset', options, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
  }

  async send2faCode(to: string, code: string, requestId?: string) {
    const options: MailOptions = {
      to,
      subject: 'Seu código de verificação 2FA',
      template: 'two-factor-code',
      context: { code },
      requestId,
    };

    await this.mailQueue.add('two-factor-code', options, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
  }

  async sendSecurityAlert(to: string, alertType: string, requestId?: string) {
    const options: MailOptions = {
      to,
      subject: 'Alerta de Segurança',
      template: 'security-alert',
      context: { alertType },
      requestId,
    };

    await this.mailQueue.add('security-alert', options, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
  }
}
